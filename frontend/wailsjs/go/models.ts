export namespace dto {
	
	export class CreateCommentatorRequest {
	    name: string;
	    handle: string;
	    pronouns: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateCommentatorRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.handle = source["handle"];
	        this.pronouns = source["pronouns"];
	    }
	}
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
	export class CreatePlayerRequest {
	    tag: string;
	    team: string;
	    region: string;
	
	    static createFrom(source: any = {}) {
	        return new CreatePlayerRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tag = source["tag"];
	        this.team = source["team"];
	        this.region = source["region"];
	    }
	}
	export class CreateSetRequest {
	    tournament_id: string;
	    player1_id: string;
	    player2_id: string;
	    round: string;
	    best_of: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateSetRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tournament_id = source["tournament_id"];
	        this.player1_id = source["player1_id"];
	        this.player2_id = source["player2_id"];
	        this.round = source["round"];
	        this.best_of = source["best_of"];
	    }
	}
	export class CreateTournamentRequest {
	    event_id: string;
	    name: string;
	    game: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateTournamentRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.event_id = source["event_id"];
	        this.name = source["name"];
	        this.game = source["game"];
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
	export class ReportSetRequest {
	    set_id: string;
	    winner_id: string;
	    player1_score: number;
	    player2_score: number;
	
	    static createFrom(source: any = {}) {
	        return new ReportSetRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.set_id = source["set_id"];
	        this.winner_id = source["winner_id"];
	        this.player1_score = source["player1_score"];
	        this.player2_score = source["player2_score"];
	    }
	}
	export class UpdateMatchRequest {
	    player1Name: string;
	    player1Team: string;
	    player1Score: number;
	    player1Character: string;
	    player2Name: string;
	    player2Team: string;
	    player2Score: number;
	    player2Character: string;
	    round: string;
	    bestOf: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateMatchRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.player1Name = source["player1Name"];
	        this.player1Team = source["player1Team"];
	        this.player1Score = source["player1Score"];
	        this.player1Character = source["player1Character"];
	        this.player2Name = source["player2Name"];
	        this.player2Team = source["player2Team"];
	        this.player2Score = source["player2Score"];
	        this.player2Character = source["player2Character"];
	        this.round = source["round"];
	        this.bestOf = source["bestOf"];
	    }
	}
	export class UpdateSetScoreRequest {
	    set_id: string;
	    player1_score: number;
	    player2_score: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateSetScoreRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.set_id = source["set_id"];
	        this.player1_score = source["player1_score"];
	        this.player2_score = source["player2_score"];
	    }
	}
	export class UpdateTournamentRequest {
	    id: string;
	    name: string;
	    game: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateTournamentRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.game = source["game"];
	    }
	}

}

export namespace model {
	
	export class Commentator {
	    id: string;
	    name: string;
	    handle: string;
	    pronouns: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Commentator(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.handle = source["handle"];
	        this.pronouns = source["pronouns"];
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
	export class Player {
	    id: string;
	    tag: string;
	    team: string;
	    region: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Player(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.tag = source["tag"];
	        this.team = source["team"];
	        this.region = source["region"];
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
	export class Set {
	    id: string;
	    tournament_id: string;
	    player1_id: string;
	    player2_id: string;
	    winner_id: string;
	    player1_score: number;
	    player2_score: number;
	    round: string;
	    best_of: number;
	    status: string;
	    external_id: string;
	    player1?: Player;
	    player2?: Player;
	    winner?: Player;
	    // Go type: time
	    created_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Set(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.tournament_id = source["tournament_id"];
	        this.player1_id = source["player1_id"];
	        this.player2_id = source["player2_id"];
	        this.winner_id = source["winner_id"];
	        this.player1_score = source["player1_score"];
	        this.player2_score = source["player2_score"];
	        this.round = source["round"];
	        this.best_of = source["best_of"];
	        this.status = source["status"];
	        this.external_id = source["external_id"];
	        this.player1 = this.convertValues(source["player1"], Player);
	        this.player2 = this.convertValues(source["player2"], Player);
	        this.winner = this.convertValues(source["winner"], Player);
	        this.created_at = this.convertValues(source["created_at"], null);
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
	export class Tournament {
	    id: string;
	    event_id: string;
	    name: string;
	    game: string;
	    source: string;
	    external_id: string;
	    bracket_type: string;
	    status: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Tournament(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.event_id = source["event_id"];
	        this.name = source["name"];
	        this.game = source["game"];
	        this.source = source["source"];
	        this.external_id = source["external_id"];
	        this.bracket_type = source["bracket_type"];
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

export namespace system {
	
	export class CharacterInfo {
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new CharacterInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class GameManifest {
	    name: string;
	    characters_per_player: number;
	    characters: CharacterInfo[];
	
	    static createFrom(source: any = {}) {
	        return new GameManifest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.characters_per_player = source["characters_per_player"];
	        this.characters = this.convertValues(source["characters"], CharacterInfo);
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
	export class InstalledAsset {
	    dir_name: string;
	    name: string;
	    characters_per_player: number;
	    character_count: number;
	
	    static createFrom(source: any = {}) {
	        return new InstalledAsset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dir_name = source["dir_name"];
	        this.name = source["name"];
	        this.characters_per_player = source["characters_per_player"];
	        this.character_count = source["character_count"];
	    }
	}
	export class OverlayField {
	    key: string;
	    label: string;
	    type: string;
	    options?: string[];
	
	    static createFrom(source: any = {}) {
	        return new OverlayField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.label = source["label"];
	        this.type = source["type"];
	        this.options = source["options"];
	    }
	}
	export class OverlayManifest {
	    name: string;
	    subscribes: string[];
	    fields: OverlayField[];
	
	    static createFrom(source: any = {}) {
	        return new OverlayManifest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.subscribes = source["subscribes"];
	        this.fields = this.convertValues(source["fields"], OverlayField);
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
	export class PackInfo {
	    dir_name: string;
	    name: string;
	    author: string;
	    version: string;
	    description: string;
	    overlays: string[];
	
	    static createFrom(source: any = {}) {
	        return new PackInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dir_name = source["dir_name"];
	        this.name = source["name"];
	        this.author = source["author"];
	        this.version = source["version"];
	        this.description = source["description"];
	        this.overlays = source["overlays"];
	    }
	}

}

