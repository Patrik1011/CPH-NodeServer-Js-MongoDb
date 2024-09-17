const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("textAreaInput");
const responseMessage = document.getElementById("responseMessage");
const messageList = document.getElementById("messageList");

const url = "http://localhost:3000/";
let idOfMessageToUpdate = null;

const createDeleteButton = (messageId) => {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";
  deleteButton.dataset.id = messageId;
  return deleteButton;
};

const createUpdateButton = (messageId) => {
  const updateButton = document.createElement("button");
  updateButton.textContent = "Update";
  updateButton.className = "update-button";
  updateButton.dataset.id = messageId;
  return updateButton;
};

const deleteMessage = async (messageId) => {
  try {
    const response = await fetch(url + messageId, {
      method: "DELETE",
    });

    if (response.ok) {
      responseMessage.textContent = "Message deleted.";
      await fetchMessages();
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    responseMessage.textContent = "Failed to delete message.";
    console.error("Error deleting message:", error);
  }
};

const updateMessageToInputField = async (messageId) => {
  try {
    const response = await fetch(url + messageId, {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json();
      messageInput.value = result.content;
      idOfMessageToUpdate = messageId;
      console.log("id to be updated:", messageId);
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    responseMessage.textContent = "Failed to get message.";
    console.error("Error getting message:", error);
  }
};

const updateMessage = async (id, message, responseText, textInput, url) => {
  if (id) {
    console.log("updating message with id:", id);
    try {
      const response = await fetch(url + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      });

      if (response.ok) {
        responseText.textContent = "Message updated.";
        textInput.value = "";
        id = null;
        await fetchMessages();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      responseText.textContent = "Failed to update message.";
      console.error("Error updating message:", error);
    }
    return;
  }
};

const fetchMessages = async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const messages = await response.json();
    messageList.innerHTML = "";
    messages.forEach((message) => {
      const messageElement = document.createElement("li");
      const deleteButton = createDeleteButton(message._id);
      const updateButton = createUpdateButton(message._id);

      deleteButton.addEventListener("click", () => {
        deleteMessage(message._id);
      });

      updateButton.addEventListener("click", () => {
        updateMessageToInputField(message._id);
      });

      messageElement.textContent = message.content;
      messageList.appendChild(messageElement);
      messageElement.appendChild(deleteButton);
      messageElement.appendChild(updateButton);
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    responseMessage.textContent = "Failed to fetch messages.";
  }
};

window.onload = fetchMessages;

sendButton.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (message === "") {
    responseMessage.textContent = "Please enter a message.";
    return;
  }

  if (idOfMessageToUpdate) {
    await updateMessage(
      idOfMessageToUpdate,
      message,
      responseMessage,
      messageInput,
      url
    );
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    if (response.ok) {
      const result = await response.json();
      responseMessage.textContent = `Message sent with ID: ${result.id}`;
      messageInput.value = "";
      await fetchMessages();
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    responseMessage.textContent = "Failed to send message.";
    console.error("Error sending message:", error);
  }
});
