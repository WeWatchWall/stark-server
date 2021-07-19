import assert from "assert";
import { ObjectModel } from "objectmodel";
import { Availability } from "../../shared/objectmodels/availability";
import { DeploymentMode } from "../../shared/objectmodels/deploymentMode";
import { ProvisionStatus } from "../../shared/objectmodels/provisionStatus";

export class PodConfig {
	db: any;
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
	constructor(arg = { db: undefined, arg: undefined},  validate = false) {
		this.db = arg.db;
		this.arg = arg.arg;
		this.validate = validate;
	}

    init() { throw new Error("This method is not implemented."); }
	
	/**
	 * Parses user.
	 * @param arg 
	 */
	parse(arg: string) {
		this.arg = JSON.parse(arg);
		if (this.validate) { this.validateNew(); }
	}
	
  async load() {
    if (this.state) { return; }
    if (this.validate) { this.validateNew(); }

    this.state = (await this.arg.userDb.find({
      selector: {
        data: {
          'availability': Availability.Any,
          'mode': this.arg.mode
        }
      }
    })).docs;
    this.state = await this.arg.userDb.rel.parseRelDocs('packageConfig', this.state);
    this.state = this.state.packageConfigs;
    this.validateState();

    for (let packageConfig of this.state) {
      packageConfig.attachment = await this.arg.userDb.rel.getAttachment('packageConfig', packageConfig.id, 'package.zip.pgp');
    }
	}

  async save() {
    if (!this.state) { await this.load(); } // TODO: USE THIS PATTERN!

    let read = this.state;	
    this.state = [];

    let result;
    for (let packageConfig of read) {
      result = await this.db.rel.save('podConfig', {
        ...packageConfig, ...{
          id: undefined,
          rev: undefined,
          attachment: undefined,
          attachments: undefined,
          
          availability: undefined, 
          security: undefined,
          tags: undefined,
          status: ProvisionStatus.Init,
          maxPods: undefined,
          numPods: 1,
          error: 'empty'
        }
      });
      await this.db.rel.putAttachment('podConfig', result, 'package.zip.pgp', packageConfig.attachment, 'text/plain');
      this.state.push(result);
    }

    this.validateState();
	}

	toString() {
		this.string = JSON.stringify(this.state);
	}
	
  async delete() {
    throw new Error("This method is not implemented.");
	}

  private newDeployConfigModel = ObjectModel({
    userDb: Object,
    mode: [DeploymentMode.Core, DeploymentMode.Edge, DeploymentMode.Browser]
  });

  private validateNew() {
    this.arg = new this.newDeployConfigModel(this.arg);
  }

  private validateState() {
    assert(!!this.state);
    assert(!!this.state.length);
  }
	
}