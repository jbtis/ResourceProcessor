class BaseNode {
    constructor(name, inputs = [], outputs = [], executionTimeMs = 1000) {
      this.name = name;
      this.inputs = inputs;
      this.outputs = outputs;
      this.executionTimeMs = executionTimeMs;
      this.isProducing = false;
      this.productionCounter = 0;
      this.stockpile = []
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
  
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  module.exports = BaseNode;
  