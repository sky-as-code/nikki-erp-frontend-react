import authorize from './nikki/authorize.json';
import drive from './nikki/drive.json';
import general from './nikki/general.json';
import identity from './nikki/identity.json';
import inventory from './nikki/inventory.json';
import shell from './nikki/shell.json';
import vendingMachine from './nikki/vendingMachine.json';


const vi = {
	nikki: {
		shell,
		drive,
		general,
		identity,
		authorize,
		inventory,
		vendingMachine,
	},
};

export default vi;
