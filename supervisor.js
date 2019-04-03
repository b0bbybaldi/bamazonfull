var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bamazon_db',
  port : '3306'
});
 
connection.connect();

function salesbyDepartment(){
	connection.query('SELECT products.department_id AS id, departments.department_name AS name, departments.over_head_costs AS cost, SUM(sales.quantity_purchased*products.price) AS salesBy, SUM(sales.quantity_purchased*products.price) - departments.over_head_costs AS profit FROM products RIGHT JOIN sales ON products.id=sales.product_id LEFT JOIN departments ON products.department_id=departments.id GROUP BY products.department_id', function (error, results) {
		if (error) throw error;
	    console.log('');
	    console.log('Bamazon Products Sales by Department');
	    console.log('');
	    var table = new Table({
			head: ['Id', 'Department', 'OH Cost', 'Sales', 'Profit'],
			colWidths: [6, 45, 12, 12, 12],
			colAligns: ['center', 'left', 'right', 'right', 'right'],
			style: {
				head: ['blue'],
				compact: true
			}
	    });
	    for (var i = 0; i < results.length; i++) {
	      table.push([results[i].id, results[i].name, results[i].cost, results[i].salesBy, results[i].profit]);
	    }
    	console.log(table.toString());
    	console.log('');
    	initialPrompt();
	});
}

function viewDepartments(){
	connection.query('SELECT * FROM Departments', function (error, results) {
		if (error) throw error;
	    console.log('');
	    console.log('Departments List');
	    console.log('');
	    var table = new Table({
			head: ['Depart. Id', 'Description', 'OH Cost'],
			colWidths: [14, 45, 12],
			colAligns: ['center', 'left', 'right'],
			style: {
				head: ['blue'],
				compact: true
			}
	    });
	    for (var i = 0; i < results.length; i++) {
	      table.push([results[i].id, results[i].department_name, results[i].over_head_costs]);
	    }
    	console.log(table.toString());
    	console.log('');
    	initialPrompt();
	});
}

function addNewDepartment(){
	inquirer.prompt([
		{type: "input",
		name: "name",
		message: "Please enter the name of the Department you wish to add"},
		{type: "input",
		name: "ohCost",
		message: "Please enter the Overhead Cost?"}
	]).then(function(data) {
	var name = data.name;
	var ohCost = data.ohCost;
	connection.query("INSERT INTO departments SET ?", {
		department_name: name, 
		over_head_costs: ohCost, 
		}, function(err,insertResult){
		  	if(err) console.log('Error: ' + err);
    		console.log('');
		  	console.log('New Department ' + name + ' has been added');
    		console.log('');
			initialPrompt();
		});
	});
}

function viewSales(){
		connection.query('SELECT sales.product_id AS id, products.products_name AS name, sum(quantity_purchased) AS qty, SUM(sales.quantity_purchased*products.price) AS salesBy FROM sales LEFT JOIN products ON sales.product_id=products.id GROUP BY product_id', function (error, results) {
		if (error) throw error;
	    console.log('');
	    console.log('Sales by Product');
	    console.log('');
	    var table = new Table({
			head: ['Id', 'Description', 'QTY', 'Total'],
			colWidths: [6, 45, 12, 12],
			colAligns: ['center', 'left', 'right', 'right'],
			style: {
				head: ['blue'],
				compact: true
			}
	    });
	    for (var i = 0; i < results.length; i++) {
	      table.push([results[i].id, results[i].name, results[i].qty, results[i].salesBy]);
	    }
    	console.log(table.toString());
    	console.log('');
    	initialPrompt();
	});
}

function initialPrompt(){
	inquirer.prompt({
          name: 'selection',
          type: 'rawlist',
          choices: ['View Product Sales by Department', 'View Departments', 'View Sales' ,'Create New Department', 'Exit'],
          message: 'Select one of the following options: ',
          default: 'Number'
        }).then(function (answer) {
    		switch(answer.selection){
    			case 'View Product Sales by Department':
    				salesbyDepartment();
    				break;
     			case 'View Departments':
     				viewDepartments();
     				break;
     			case 'View Sales':
     				viewSales();
     				break;
     			case 'Create New Department':
    				// displayProducts();
    				addNewDepartment();
    				break;
    			case 'Exit':
    				connection.end();
    				break;
    		}
	});
}

initialPrompt();