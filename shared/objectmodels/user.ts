export abstract class User {
	server: any;
	arg: any;
	validate: boolean;
	state: any;
	string: string;
	
	/**
	 * Creates an instance of user.
	 * @param [arg.db]
	 * @param [arg.arg]
	 * @param [validate] Is necessary because the arg could be used to load (future).
	 */
	constructor(arg = { server: undefined, arg: undefined},  validate = false) {
		this.server = arg.server;
		this.arg = arg.arg;
		this.validate = validate;
	}

	abstract init(): void;
	
	/**
	 * Parses user.
	 * @param arg 
	 */
	parse(arg: string) {
		this.arg = JSON.parse(arg);
		if (this.validate) { this.validateNew(); }
	}
	
	async load() {
		if (this.state) {return;}

        this.state = {
            name: process.env.STARK_USER_NAME,
            password: process.env.STARK_USER_PASSWORD,
            key: process.env.STARK_USER_KEY
		}
		
		this.validateState();
	}

    async save() {
        throw new Error("This method is not implemented.");
	}

	toString() {
		this.string = JSON.stringify(this.state);
	}
	
    async delete() {
        throw new Error("This method is not implemented.");
	}

	// :() Constructor type?
	protected abstract newUserModel: new (arg0: any) => any;

    protected validateNew() {
        this.arg = new this.newUserModel(this.arg);
    }

    protected abstract stateUserModel: new (arg0: any) => any;

	protected validateState() {
		this.arg = new this.stateUserModel(this.state);
	}
	
}