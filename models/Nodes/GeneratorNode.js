const BaseNode = require('./BaseNode');
const { Resource } = require('./Resource');

class GeneratorNode extends BaseNode {
  constructor(name, output, resourceType = '', executionTimeMs = 1000) {
    super(name, [], [output], executionTimeMs);
    this.resourceType = resourceType;
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
      this.productionCounter += 1
      const id = this.name + '.' + this.resourceType + '.' + this.productionCounter.toString(); // Replace with actual ID generation logic
      const resource = new Resource(id, this.resourceType);
      console.log(`${this.name} produced ${this.resourceType}`);

      if (this.outputs[0] !== null){
        this.outputs[0].put(resource);
      } else {
        this.stockpile.push(resource);
      }

      await this.sleep(this.executionTimeMs);
    }
  }

  stop() {
    this.isProducing = false;
    console.log(`${this.name} has stopped production.`);
  }
}

module.exports = GeneratorNode;
