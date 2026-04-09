package startgg

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

const endpoint = "https://api.start.gg/gql/alpha"

type Client struct {
	token string
	http  *http.Client
}

type graphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables,omitempty"`
}

type graphQLResponse struct {
	Data   json.RawMessage `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func NewClient(token string) *Client {
	return &Client{token: token, http: &http.Client{}}
}

func (c *Client) query(q string, vars map[string]any, out any) error {
	reqBody, err := json.Marshal(graphQLRequest{Query: q, Variables: vars})
	if err != nil {
		return fmt.Errorf("startgg: marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewReader(reqBody))
	if err != nil {
		return fmt.Errorf("startgg: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.token)

	log.Printf("[startgg] POST %s (token present: %v)", endpoint, c.token != "")

	resp, err := c.http.Do(req)
	if err != nil {
		log.Printf("[startgg] request failed: %v", err)
		return fmt.Errorf("startgg: http: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[startgg] failed to read response body: %v", err)
		return fmt.Errorf("startgg: read response: %w", err)
	}

	log.Printf("[startgg] response status: %d, body length: %d", resp.StatusCode, len(body))
	if len(body) > 0 {
		preview := string(body)
		if len(preview) > 500 {
			preview = preview[:500] + "..."
		}
		log.Printf("[startgg] response body: %s", preview)
	}

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("startgg: invalid or missing API token (HTTP 401)")
	}
	if resp.StatusCode != http.StatusOK {
		preview := string(body)
		if len(preview) > 200 {
			preview = preview[:200] + "..."
		}
		return fmt.Errorf("startgg: unexpected status %d: %s", resp.StatusCode, preview)
	}

	if len(body) == 0 {
		return fmt.Errorf("startgg: empty response body")
	}

	var gqlResp graphQLResponse
	if err := json.Unmarshal(body, &gqlResp); err != nil {
		log.Printf("[startgg] JSON unmarshal failed: %v", err)
		return fmt.Errorf("startgg: decode response: %w", err)
	}

	if len(gqlResp.Errors) > 0 {
		msgs := make([]string, len(gqlResp.Errors))
		for i, e := range gqlResp.Errors {
			msgs[i] = e.Message
		}
		return fmt.Errorf("startgg: api errors: %s", strings.Join(msgs, "; "))
	}

	return json.Unmarshal(gqlResp.Data, out)
}
