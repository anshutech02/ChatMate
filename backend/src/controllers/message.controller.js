const messageModel = require("../models/message.model")


const getMessages = async(req,res)=>{
    const chatId = req.params.chatId;
    const userId = req.user._id;

    const userchatMessages =await messageModel.find({chatId,userId});
    res.json({
        message: "messages fetched successfully",
        messages : userchatMessages
    })
}
const deleteMessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    await messageModel.deleteMany({ chatId });

    res.status(200).json({
      success: true,
      message: "Messages deleted successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


module.exports = {
    getMessages,
    deleteMessage
}