export namespace sse {
	
	export class MatchDataUpdateDTO {
	    player1Name: string;
	    player1Team: string;
	    player1Score: number;
	    player2Name: string;
	    player2Team: string;
	    player2Score: number;
	    round: string;
	
	    static createFrom(source: any = {}) {
	        return new MatchDataUpdateDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.player1Name = source["player1Name"];
	        this.player1Team = source["player1Team"];
	        this.player1Score = source["player1Score"];
	        this.player2Name = source["player2Name"];
	        this.player2Team = source["player2Team"];
	        this.player2Score = source["player2Score"];
	        this.round = source["round"];
	    }
	}

}

