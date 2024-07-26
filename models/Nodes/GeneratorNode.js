const Node = require('./Node');
const { Resource } = require('./Resource');

class GeneratorNode extends Node {
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
      const id = 'TO_DO_GENERATE_ID'; // Replace with actual ID generation logic
      const resource = new Resource(id, this.resourceType);
      console.log(`${this.name} produced ${resource.name}`);
      this.outputs[0].put(resource);
      await this.sleep(this.executionTimeMs);
    }
  }

  stop() {
    this.isProducing = false;
    console.log(`${this.name} has stopped production.`);
  }
}

module.exports = GeneratorNode;
