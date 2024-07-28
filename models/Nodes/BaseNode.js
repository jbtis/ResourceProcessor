class BaseNode {
    constructor(name, inputs = [], outputs = [], executionTimeS = 1) {
      this.name = name;
      this.inputs? this.inputs = inputs: this.inputs = [];
      this.outputs? this.outputs = outputs: this.outputs = [];
      this.executionTimeS = executionTimeS;
      this.isProducing = false;
      this.productionCounter = 0;
      this.stock = {};
    }
  
    addInput(channel) {
      this.inputs.push(channel);
    }
  
    addInputs(channels) {
      for (const channel of channels) {
        this.addInput(channel);
      }
    }
  
    addOutput(channel) {
      this.outputs.push(channel);
    }
  
    addOutputs(channels) {
      for (const channel of channels) {
        this.addOutput(channel);
      }
    }

      // Add resource to the stock
    addResource(resource) {
      if (!this.stock[resource.type]) {
        this.stock[resource.type] = [];
      }
      this.stock[resource.type].push(resource);
    }

    // Remove resource from the stock
    takeResource(resourceName) {
      if (this.stock[resourceName] && this.stock[resourceName].length > 0) {
        return this.stock[resourceName].shift();
      } else {
        return null;
      }
    }
  
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  module.exports = BaseNode;
  