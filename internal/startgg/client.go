package startgg

import (
	"bytes"
	"encoding/json"
	"fmt"
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
	body, err := json.Marshal(graphQLRequest{Query: q, Variables: vars})
	if err != nil {
		return fmt.Errorf("startgg: marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("startgg: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("startgg: http: %w", err)
	}
	defer resp.Body.Close()

	var gqlResp graphQLResponse
	if err := json.NewDecoder(resp.Body).Decode(&gqlResp); err != nil {
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
