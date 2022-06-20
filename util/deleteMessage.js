async function deleteMessage(client, req, res) {
  try {
    const fetchMessage = await client.channels.fetch(req.body.channelId);
    const msg = await fetchMessage.messages.fetch(req.body.messageId);
    msg.delete();
    res.status(200).send({ message: 'Successfully!' });
  } catch (error) {
    console.log(error);
  }
}
module.exports = deleteMessage;
