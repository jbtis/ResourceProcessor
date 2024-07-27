const GeneratorNode = require('../Nodes/GeneratorNode');
const ProductionNode = require('../Nodes/ProductionNode');
const StorageNode = require('../Nodes/StorageNode');
const Channel = require('../Nodes/Channel');
const Resource = require('../Nodes/Resource');
const prompt = require('prompt-sync')();

class Simulator {
  constructor() {
    this.GeneratorNodes = [];
    this.ProductionNodes = [];
    this.StorageNodes = [];
    this.Channels = [];
  }

  run() {
    console.log('Welcome to Resource Processor');
    while (true) {
      const command = prompt();
      if (typeof command !== 'string' || command === '') {
        console.log('Invalid command');
      } else if (command === 'q') {
        console.log('Exiting');
        break;
      } else {
        const parts = command.split(' ');
        const cmd = parts[0];

        if (cmd === 'g' && parts.length === 4) {
          const [name, resourceType, executionTimeMs] = parts.slice(1);
          const executionTime = parseInt(executionTimeMs, 10);

          if (isNaN(executionTime)) {
            console.log('Invalid execution time');
            continue;
          }

          const generator = new GeneratorNode(name, null, resourceType, executionTime);
          generator.produce();
          this.GeneratorNodes.push(generator);
          console.log(`GeneratorNode ${name} producing ${resourceType} every ${executionTimeMs}ms created and started.`);
        } else {
          console.log('Invalid command format');
        }
      }
    }
  }

  // Checks to see if connection is valid and then connects the output of node1 to the input of node2 by creating a new channel
  connect(node1, node2) {
    if (
      (node1 instanceof GeneratorNode || node1 instanceof ProductionNode) &&
      (node2 instanceof ProductionNode || node2 instanceof StorageNode)
    ) {
      // Create channel
      let channelName = node1.name + '->' + node2.name;
      let channel = new Channel(channelName);
      node1.addOutput(channel);
      node2.addInput(channel);
      console.log('Connected nodes!');
    } else {
      console.log(
        'Invalid Channel Creation. First node must be GeneratorNode or ProductionNode. Second node must be ProductionNode or StorageNode'
      );
    }
  }
}

module.exports = Simulator;
