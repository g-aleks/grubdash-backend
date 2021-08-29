const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next){
    const {orderId} = req.params
    const foundOrder = orders.find((order)=>order.id == orderId)
    if (!foundOrder){
        next({
            status: 404,
            message: `Order id not found ${orderId}`
        })
    }
    res.locals.order = foundOrder
    next()
}

function read(req, res, next){
    res.json({data: res.locals.order})
}

function list(req, res, next){
    res.json({data: orders})
}

function update(req, res, next){
    let order = res.locals.order
    const {orderId} = req.params
    const {data = {}} = req.body
    if(order !== data){
        order = data
    }
    if (orderId && !order.id){
        order.id = orderId
    }
    res.json({data: order})
}

function destroy(req, res, next){
    const index = orders.findIndex((order)=> order.id == res.locals.order.id )
    const deletedOrders = orders.splice(index, 1)
    res.sendStatus(204)
}

function create(req, res, next){
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

function hasDeliverTo(req, res, next){
    const {data: {deliverTo} = {}} = req.body
    if (deliverTo){
        return next()
    }
    next({
        status: 400,
        message: "Order must include a deliverTo"
    })
}

function hasMobileNumber(req, res, next){
    const {data: {mobileNumber} = {}} = req.body
    if (mobileNumber){
        next()
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber"
    })
}

function validDishes(req, res, next){
    const {data: {dishes} = []} = req.body
    if(dishes === undefined || !dishes.length ){
        next({
            status: 400,
            message: "Order must include a dish"
        })
    }
    if (!dishes || !Array.isArray(dishes)){
        next({
            status: 400,
            message: "Order must include at least one dish"
        })
    }
    next()
}

function validQuantity(req, res, next){
    const {data: {dishes} = []} = req.body
    for (let dish of dishes){
        const {id, quantity} = dish
        const index = dishes.findIndex((item)=> item.id == id )
        if (!quantity || typeof quantity != "number"){
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    }
    next()
}

function idMatch(req, res, next){
    const {orderId} = req.params
    const {data: {id} = {}} = req.body
    if (!id){
        next()
    }
    if (orderId != id){
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
        })
    }
    next()
}

function hasStatus(req, res, next){
    const {status} = req.body.data
    if (!status || status === "invalid"){
        next({
            status: 400,
            message: `Order must have a valid status`
        })
    }
    next()
}

function deleteStatus(req, res, next){
    const {status} = res.locals.order
    if (status !== "pending"){
        next({
            status: 400,
            message: `Status must be pending in order to delete. Status: ${status}`
        })
    }
    next()
}

module.exports = {
    list,
    read: [orderExists, read],
    update: [orderExists, hasStatus, hasDeliverTo, hasMobileNumber, validDishes, validQuantity, idMatch, update],
    delete: [orderExists, deleteStatus, destroy],
    create: [hasDeliverTo, hasMobileNumber, validDishes, validQuantity, create]
}