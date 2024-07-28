const BaseNode = require('./BaseNode');
const { Resource } = require('./Resource');

class GeneratorNode extends BaseNode {
  constructor(name, output, resourceType, executionTimeS) {
    super(name, [], [output], executionTimeS);
    this.resourceType = resourceType;

    // Add stock for the only resource type of the generator
    this.stock[resourceType] = []
  }

  addInput(channel) {
    throw new Error('GeneratorNode cannot have input channels.');
  }

  addInputs(channels) {
    throw new Error('GeneratorNode cannot have input channels.');
  }

  async produce() {
    this.isProducing = true;
    console.log(`${this.name} has started production!`);

    while (this.isProducing) {

      // Produce resource
      this.productionCounter += 1
      const id = this.name + '.' + this.resourceType + '.' + this.productionCounter.toString(); 
      const resource = new Resource(id, this.resourceType);
      console.log(`${this.name} produced ${this.resourceType} [${this.stock[this.resourceType].length}]`);

      // Add resource to stock
      this.stock[this.resourceType].push(resource)

      // Wait to try to produce next resource
      await this.sleep(this.executionTimeS * 1000);
    }
  }

  stop() {
    this.isProducing = false;
    console.log(`${this.name} has stopped production.`);
  }
}

module.exports = GeneratorNode;
