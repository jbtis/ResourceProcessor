const BaseNode = require('./BaseNode');
const { Resource } = require('./Resource');

class ProductionNode extends BaseNode {
  constructor(name, inputs = [], output, resourceType, recipe = {}, executionTimeS = 1) {
    super(name, inputs, [output], executionTimeS);
    this.resourceType = resourceType;
    this.recipe = recipe;
    this.productionCounter = 0;

    // Populate the stock dictionary with input and output resource types
    for (let resourceName of Object.keys(recipe)) {
      this.stock[resourceName] = [];
    }
    this.stock[resourceType] = [];
  }

  // Method to check if all required resources are available in the stock
  areResourcesAvailable() {
    for (let [resourceName, quantity] of Object.entries(this.recipe)) {
      if (!this.stock[resourceName] || this.stock[resourceName].length < quantity) {
        return false;
      }
    }
    return true;
  }

  // Method to consume resources from the stock
  consumeResources() {
    for (let [resourceName, quantity] of Object.entries(this.recipe)) {
      this.stock[resourceName].splice(0, quantity);
    }
  }

  async produce() {
    this.isProducing = true;
    console.log(`${this.name} has started production!`);

    while (this.isProducing) {
      if (this.areResourcesAvailable()) {
        // Produce resource
        this.consumeResources();
        await this.sleep(this.executionTimeS * 1000);
        this.productionCounter += 1;
        const resource_id = `${this.name}.${this.resourceType}.${this.productionCounter}`;
        const resource = new Resource(resource_id, this.resourceType);
        console.log(`${this.name} produced ${this.resourceType}`);

        // Add resource to stock
        this.stock[this.resourceType].push(resource);
      } else {
        console.log(`${this.name} tried to produce but there were not enough resources`);
      }
      // Wait to try to produce next resource
      await this.sleep(this.executionTimeS * 1000);
    }
  }

  stop() {
    this.isProducing = false;
    console.log(`${this.name} has stopped production.`);
  }
}

module.exports = ProductionNode;
