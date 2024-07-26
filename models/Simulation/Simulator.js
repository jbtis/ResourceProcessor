const { GeneratorNode } = require('../Nodes/GeneratorNode');
const { ProductionNode } = require('../Nodes/ProductionNode');
const { StorageNode } = require('../Nodes/StorageNode');
const { Channel } = require('../Nodes/Channel');
const { Resource } = require('../Nodes/Resource');
const prompt = require('prompt-sync')();


class Simulator{
    constructor(){
        this.GeneratorNodes = []
        this.ProductionNode = []
        this.StorageNodes = []
        this.Channel = []
    }

    run(){
        console.log('Welcome to Resource Processor')
        while(true){
            const command = prompt();
            if (typeof command !== 'string' || command === ''){
                console.log('Invalid command')
            } else if(command === 'q'){
                console.log('Exiting')
                break;
            } else{

                console.log('valid command!')
                // Choose between creating generator nodes
            }       
        }
    }

    // Checks to see if connection is valid and then connects the output of node1 to the input of node2 by creating a new channel
    connect(node1, node2){

    }



    // comment for git test

}

module.exports = Simulator;
