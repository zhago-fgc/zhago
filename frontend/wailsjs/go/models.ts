export namespace dto {
	
	export class CreateEventRequest {
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateEventRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	    }
	}
	export class MessageRequest {
	    type: string;
	    payload: any;
	
	    static createFrom(source: any = {}) {
	        return new MessageRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.payload = source["payload"];
	    }
	}
	export class UpdateMatchRequest {
	    player1Name: string;
	    player1Team: string;
	    player1Score: number;
	    player2Name: string;
	    player2Team: string;
	    player2Score: number;
	    round: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateMatchRequest(source);
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

export namespace model {
	
	export class Event {
	    id: string;
	    name: string;
	    status: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Event(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

