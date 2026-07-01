import { cancelOrderByIdService, findOrderByIdService, getAllOrdersService, getMyOrdersService, placeOrderService, updateOrderStatusService } from "./order.service.js"


export const placeOrder = async (req, res) => {
    try {
        const userId=req.user.id
        const {primary_phone,secondary_phone,shipping_address}=req.body
        const order=await placeOrderService(userId,primary_phone,secondary_phone,shipping_address)
        return res.status(201).json({message:"Order placed successfully",order})
    } catch (error) {
        return res.status(500).json({message:"Failed to place order",error:error.message})
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const userId=req.user.id
        const orders=await getMyOrdersService(userId)
        return res.status(200).json({message:"Orders fetched successfully",orders})
    } catch (error) {
        return res.status(500).json({message:"Failed to fetch orders",error:error.message})
    }
}

export const getOrderById = async (req, res) => {
    try {
        const {orderId}=req.params
        const {userId}=req.user
        const order=await findOrderByIdService(orderId,userId)
        return res.status(200).json({message:"Order fetched successfully",order})
    } catch (error) {
        return res.status(500).json({message:"Failed to fetch order",error:error.message})
    }
}

export const cancelOrder = async (req, res) => {
    try {
        const {orderId}=req.params
        const userId=req.user.id
        const order=await cancelOrderByIdService(orderId,userId)
        return res.status(200).json({message:"Order cancelled successfully",order})
    } catch (error) {
        return res.status(500).json({message:"Failed to cancel order",error:error.message})
    }
}

export const getAllOrders = async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || 10;
    const page   = parseInt(req.query.page)   || 1;
    const status = req.query.status           || null;
    
    const result = await getAllOrdersService(limit, page, status);
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      ...result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId }     = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const result = await updateOrderStatusService(orderId, status);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};