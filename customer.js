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

var display = function() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log('-----------------------------');
    console.log('      WELCOME TO BAMAZON     ');
    console.log('-----------------------------');
    console.log('');
    console.log('Find below our Products List');
    console.log('');
    var table = new Table({
      head: ['Product Id', 'Product Description', 'Cost'],
      colWidths: [12, 50, 8],
      colAligns: ['center', 'left', 'right'],
       style: {
        head: ['blue'],
        compact: true
     }
    });

    for (var i = 0; i < res.length; i++) {
      table.push([res[i].id, res[i].products_name, res[i].price]);
    }

    console.log(table.toString());
    console.log('');
    shopping()
  });
};

var shopping = function(){
  inquirer.prompt({
    name: 'productToBuy',
    type: 'input',
    message: 'Please enter the Product Id of the item you wish to purchase.!'
  }).then(function(answer1) {
    var selection = answer1.productToBuy;
    connection.query("SELECT * FROM Products WHERE id=?", selection, function(err, res){
      if (err) throw err;
      if (res.length === 0){
        console.log('That Product doesn\'t exist, Please enter a Product Id from the list above');
        shopping();
      }
      else{
        inquirer.prompt({
          name: 'quantity',
          type: 'input',
          message: 'How many items would you like to purchase?'
        }).then(function(answer2){
          var quantity = answer2.quantity;
        
          if (quantity > res[0].stock_quantity) {
            console.log('Our Apologies, we only have ' + res[0].stock_quantity + ' items of the product selected');
            shopping();
          }
          else{
            console.log('');
            console.log(res[0].products_name + ' purchased')
            console.log(quantity + ' qty @ $' + res[0].price);

            var saleTotal = quantity * res[0].price;
            saleTotal = saleTotal.toFixed(2);
            connection.query("INSERT INTO sales SET ?", {
              product_id: res[0].id, 
              quantity_purchased: quantity 
              
            }, function(err,resSale){
              if(err) console.log('Error: ' + err);
              return(resSale);
            })
            console.log('Sale Total: ' + saleTotal);
            var newQuantity = res[0].stock_quantity - quantity;
            connection.query("UPDATE products SET stock_quantity = " + newQuantity + " WHERE id = " + res[0].id, function(err, resUpdate){
              if (err) throw err;
              console.log('');
              console.log('Your Order has been Processed');
              console.log('Thank you for Shopping with us...!');
              console.log('');
              connection.end();
            });
          };
        });
      };
    });
  });
};
