const GeneratorNode = require('../Nodes/GeneratorNode');
const ProductionNode = require('../Nodes/ProductionNode');
const StorageNode = require('../Nodes/StorageNode');
const Channel = require('../Nodes/Channel');
const Resource = require('../Nodes/Resource');
const readline = require('readline');

class Simulator {
  constructor() {
    this.GeneratorNodes = [];
    this.ProductionNodes = [];
    this.StorageNodes = [];
    this.Channels = [];
    this.productionRunning = false; // Boolean flag to track production state

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Enter command: ',
    });

    this.rl.on('line', (input) => this.handleInput(input));

    console.log('Welcome to Resource Processor');
    this.rl.prompt();
  }

  handleInput(command) {
    if (typeof command !== 'string' || command === '') {
      console.log('Invalid command');
    } else if (command.startsWith('gen ')) {
      this.checkGeneratorCommand(command);
    } else if (command.startsWith('prod ')) {
      this.checkProductionCommand(command);
    } else if (command.startsWith('stor ')) {
      this.checkStorageCommand(command);
    } else if (command.startsWith('connect ')) {
      this.checkConnectCommand(command);
    } else if (command.startsWith('start ')) {
      this.checkStartCommand(command);
    } else if (command.startsWith('stop ')) {
      this.checkStopCommand(command);
    } else if (command === 'ls') {
      this.listNodes();
    } else if (command.startsWith('del ')) {
      this.deleteNode(command);
    } else {
      console.log('Invalid command');
    }

    this.rl.prompt();
  }

  nodeExists(name) {
    return this.GeneratorNodes.some(node => node.name === name) ||
           this.ProductionNodes.some(node => node.name === name) ||
           this.StorageNodes.some(node => node.name === name);
  }

  checkGeneratorCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 4) {
      const [_, name, resourceType, executionTimeMs] = parts;
      const executionTime = parseInt(executionTimeMs, 10);

      if (isNaN(executionTime)) {
        console.log('Invalid execution time');
        return;
      }

      if (this.nodeExists(name)) {
        console.log(`Node with name ${name} already exists.`);
        return;
      }

      const generator = new GeneratorNode(name, null, resourceType, executionTime);
      this.GeneratorNodes.push(generator);
      console.log(`GeneratorNode ${name} producing ${resourceType} every ${executionTimeMs}s created.`);
    } else {
      console.log('Invalid command format');
    }
  }

  checkProductionCommand(command) {
    const parts = command.split(' ');
    if (parts.length >= 3) {
      const [_, name, ...recipeParts] = parts;
      const recipe = {};
      
      for (let i = 0; i < recipeParts.length; i += 2) {
        const resourceName = recipeParts[i];
        const resourceQuantity = parseInt(recipeParts[i + 1], 10);

        if (isNaN(resourceQuantity)) {
          console.log('Invalid recipe format');
          return;
        }

        recipe[resourceName] = resourceQuantity;
      }

      if (this.nodeExists(name)) {
        console.log(`Node with name ${name} already exists.`);
        return;
      }

      const productionNode = new ProductionNode(name, [], null, recipe);
      this.ProductionNodes.push(productionNode);
      console.log(`ProductionNode ${name} created with recipe ${JSON.stringify(recipe)}.`);
    } else {
      console.log('Invalid command format');
    }
  }

  checkStorageCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 3) {
      const [_, name, resourceType] = parts;
  
      if (this.nodeExists(name)) {
        console.log(`Node with name ${name} already exists.`);
        return;
      }
  
      const storageNode = new StorageNode(name, null, resourceType);
      this.StorageNodes.push(storageNode);
      console.log(`StorageNode ${name} created to store ${resourceType}.`);
    } else {
      console.log('Invalid command format');
    }
  }

  checkConnectCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 3) {
      const [_, outputNodeName, inputNodeName] = parts;
  
      if (this.nodeExists(outputNodeName) && this.nodeExists(inputNodeName)) {
        // Retrieve the output node
        const outputNode = this.GeneratorNodes.find(node => node.name === outputNodeName) ||
                           this.ProductionNodes.find(node => node.name === outputNodeName);
  
        // Retrieve the input node
        const inputNode = this.ProductionNodes.find(node => node.name === inputNodeName) ||
                          this.StorageNodes.find(node => node.name === inputNodeName);
  
        if (outputNode && inputNode) {
          this.connect(outputNode, inputNode);
          console.log(`Connected ${outputNodeName} to ${inputNodeName}`);
        } 
      } else {
        console.log('At least one of the target nodes does not exist.');
      }
    } else {
      console.log('Invalid command format');
    }
  }

  checkStartCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 2) {
      const [_, target] = parts;
  
      if (target === 'nodes') {
        this.startNodes();
      } else if (target === 'channels') {
        this.startChannels();
      } else if (target === 'all') {
        this.startNodes();
        this.startChannels();
      } else {
        console.log('Invalid start target. Use "nodes", "channels", or "all".');
      }
    } else {
      console.log('Invalid command format');
    }
  }

  checkStopCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 2) {
      const [_, target] = parts;
  
      if (target === 'nodes') {
        this.stopNodes();
      } else if (target === 'channels') {
        this.stopChannels();
      } else if (target === 'all') {
        this.stopNodes();
        this.stopChannels();
      } else {
        console.log('Invalid stop target. Use "nodes", "channels", or "all".');
      }
    } else {
      console.log('Invalid command format');
    }
  }
  
  startNodes() {
    console.log('Starting production for all nodes.');
    this.GeneratorNodes.forEach(generator => generator.produce());
    this.ProductionNodes.forEach(productionNode => productionNode.produce());
    this.productionRunning = true;
  }

  stopNodes() {
    console.log('Stopping production for all nodes.');
    this.GeneratorNodes.forEach(generator => generator.stop());
    this.ProductionNodes.forEach(productionNode => productionNode.stop());
    this.productionRunning = false;
  }

  startChannels() {
    console.log('Starting all channels.');
    this.Channels.forEach(channel => channel.activate());
  }

  stopChannels() {
    console.log('Stopping all channels.');
    this.Channels.forEach(channel => channel.deactivate());
  }

  listNodes() {
    console.log('Current Nodes:');
    console.log('Generator Nodes:');
    this.GeneratorNodes.forEach(node => console.log(`- ${node.name}.${node.resourceType}  @${node.executionTimeS}s [${node.stock[node.resourceType].length}]`));
    console.log('Production Nodes:');
    this.ProductionNodes.forEach(node => console.log(`- ${node.name} with recipe ${JSON.stringify(node.recipe)}`));
    console.log('Storage Nodes:');
    this.StorageNodes.forEach(node => console.log(`- ${node.name}.${node.resourceType} [${node.stock[node.resourceType].length}]`));
  }

  deleteNode(command) {
    const parts = command.split(' ');
    if (parts.length === 2) {
      const [_, name] = parts;

      const generatorIndex = this.GeneratorNodes.findIndex(node => node.name === name);
      if (generatorIndex !== -1) {
        this.GeneratorNodes.splice(generatorIndex, 1);
        console.log(`Deleted GeneratorNode ${name}.`);
        return;
      }

      const productionIndex = this.ProductionNodes.findIndex(node => node.name === name);
      if (productionIndex !== -1) {
        this.ProductionNodes.splice(productionIndex, 1);
        console.log(`Deleted ProductionNode ${name}.`);
        return;
      }

      const storageIndex = this.StorageNodes.findIndex(node => node.name === name);
      if (storageIndex !== -1) {
        this.StorageNodes.splice(storageIndex, 1);
        console.log(`Deleted StorageNode ${name}.`);
        return;
      }

      console.log(`Node with name ${name} does not exist.`);
    } else {
      console.log('Invalid command format');
    }
  }

  // Checks to see if connection is valid and then connects the output of node1 to the input of node2 by creating a new channel
  connect(outputNode, inputNode) {
    if (
      (outputNode instanceof GeneratorNode || outputNode instanceof ProductionNode) &&
      (inputNode instanceof ProductionNode || inputNode instanceof StorageNode)
    ) {
      // Create channel
      let channelName = outputNode.name + '->' + inputNode.name;
      let channel = new Channel(outputNode, inputNode, 1, 1000);
      outputNode.addOutput(channel);
      inputNode.addInput(channel);
      this.Channels.push(channel);
      console.log('Connected nodes!');
    } else {
      console.log(
        'Invalid Channel Creation. First node must be GeneratorNode or ProductionNode. Second node must be ProductionNode or StorageNode'
      );
    }
  }
}

module.exports = Simulator;
