const path = require("path");
const { runInNewContext } = require("vm");
const ordersController = require("../orders/orders.controller");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next){
    const {dishId} = req.params
    const foundDish = dishes.find((dish)=> dish.id === dishId)
    if (!foundDish){
        next({
            status: 404,
            message: `Dish does not exist ${dishId}.`
        })
    }
    res.locals.dish = foundDish
    next()
}

function read(req, res){
    res.json({data: res.locals.dish})
}

function list(req, res){
    res.json({data: dishes})
}

function create(req, res){
    const {data: {name, description, price, image_url}} = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({data: newDish})
}

function hasName(req, res, next){
    const {data: {name} ={}} = req.body
    if (!name){
        next({
            status: 400,
            message: "Dish must include a name"
        })
    }
    next()
}

function hasDesc(req, res, next){
    const {data: {description}={}} = req.body
    if (!description){
        next({
            status: 400,
            message: "Dish must include a description"
        })
    }
    next()
}

function validPrice(req, res, next){
    const {data: {price}={}}=req.body
    if (price === undefined){
        next({
            status: 400,
            message:"Dish must include a price"
        })
    }
    if (price <= 0 || typeof price != "number"){
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
    next()
}

function hasImg(req, res, next){
    const {data: {image_url}={}} = req.body
    if (!image_url){
        next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
    next()
}

function update(req, res){
    let dish = res.locals.dish
    const {dishId} = req.params
    const {data = {}} = req.body
    if(dish !== data){
        dish = data
    }
    if (!dish.id && dishId){
        dish.id = dishId
    }
    res.json({data: dish})
}

function idMatch(req, res, next){
    const {dishId} = req.params
    const {data: {id} = {}} = req.body
    if (!id){
        next()
    }
    if (dishId != id){
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }
    next()
}

module.exports = {
    read: [dishExists, read],
    list,
    create: [hasName, hasDesc, validPrice, hasImg, create],
    update: [dishExists, idMatch, hasName, hasDesc, hasImg, validPrice, update]
}