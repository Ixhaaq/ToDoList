
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// Previous way to store list values
// const items = ["Udemy Primary", "Udemy Secondary", "Project", "DSNA", "90 Day Devops", "Reading","Gym"];
// const workItems = [];


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-ishaaq:Fluffy111@cluster0.jfsji7e.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const item4 = new Item({
    name: "/(YourList) to create a custom list."
});

const defaultItems = [item1, item2, item3, item4];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})


const List = mongoose.model("List", listSchema);





app.get("/", function (req, res) {


    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {

                    console.log("Succesfully added to items databse")
                }
            });
            res.redirect("/");
        } else {

            res.render('list', {
                listTitle: "Today",
                newListItems: foundItems
            });

        }

        
    });


});


app.post("/", function (req, res) {

   const itemName =  req.body.newItem;

   const listName = req.body.list;

   const item = new Item ({
    name: itemName
   })


   if (listName === "Today"){
    item.save();
    res.redirect("/")
   } else {
    List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
    })
   }

});





app.get("/:customListName", function (req, res) {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if(!foundList){
                // create a new list 
                const list = new List({
                    name: customListName,
                    items: defaultItems

                })
                list.save()
                res.redirect("/" + customListName)
            } else {
                // show an existing list 
                res.render("list",{
                    listTitle: foundList.name,
                    newListItems: foundList.items
                })
            }
        }
    })

});



app.post("/delete", function(req, res){

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId, function(err){
            if (!err){
                console.log("Succesfully deleted item.")
                res.redirect("/")
            }
        });
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            
            if (!err){
                res.redirect("/" + listName);
            } else{
                console.log(err)
            }
        });
    }



})




app.get("/about", function (req, res) {
    res.render("about");
})

// app.post("/work", function(req, res){
//     const item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");

// })


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
    console.log("Server started successfully")
});


