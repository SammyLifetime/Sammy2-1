module.exports = {
    config: {
        name: "friends",
        aliases: ["friend"],
        version: "1.0",
        author: "Samuel Kâñèñgeè",
        countDown: 5,
        role: 0,
        shortDescription: "",
        longDescription: "",
        category: "owner",
        guide: "{pn}"
    },
    onStart: async ({ event, api, args }) => {
        /**
         * Mock API function to simulate fetching friends list
         */
        const mockGetFriendsList = async () => {
            // Simulated delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock data
            return [
                {
                    fullName: "John Doe",
                    userID: "123",
                    gender: "male",
                    vanity: "john.doe",
                    profileUrl: "http://facebook.com/johndoe"
                },
                {
                    fullName: "Jane Smith",
                    userID: "456",
                    gender: "female",
                    vanity: "jane.smith",
                    profileUrl: "http://facebook.com/janesmith"
                },
                // Add more mock friends if needed
            ];
        };

        try {
            console.log("Fetching friends list...");
            var listFriend = [];
            var dataFriend = await mockGetFriendsList(); // Using the mock API function instead
            console.log("Friends list fetched:", dataFriend);

            if (!Array.isArray(dataFriend)) {
                throw new Error("Invalid data format from API");
            }

            var countFr = dataFriend.length;

            // Process each friend data
            for (var friend of dataFriend) {
                listFriend.push({
                    name: friend.fullName || "Unnamed",
                    uid: friend.userID,
                    gender: friend.gender,
                    vanity: friend.vanity,
                    profileUrl: friend.profileUrl
                });
            }

            // Pagination setup
            var nameUser = [];
            var urlUser = [];
            var uidUser = [];
            var page = args[0] ? parseInt(args[0]) : 1;
            if (page < 1) page = 1;
            var limit = 10;
            var offset = limit * (page - 1);
            var numPage = Math.ceil(listFriend.length / limit);

            // Message composition
            var msg = `You have ${countFr} friend/s\n`;
            for (var i = offset; i < offset + limit; i++) {
                if (i >= listFriend.length) break;
                let infoFriend = listFriend[i];
                msg += `${i + 1}. ${infoFriend.name}\nID: ${infoFriend.uid}\nGender: ${infoFriend.gender}\nVanity: ${infoFriend.vanity}\nFacebook Link: ${infoFriend.profileUrl}\n\n`;
                nameUser.push(infoFriend.name);
                urlUser.push(infoFriend.profileUrl);
                uidUser.push(infoFriend.uid);
            }

            msg += `Page ${page}/${numPage}\nUse ${global.config.PREFIX}friend <number>/all\n`;

            // Send response back to user and set up response handler
            return api.sendMessage(
                msg + `Reply with the number of your friend if you want to remove it. You can also unfriend multiple using comma-separated numbers (e.g., 1,2,3).`,
                event.threadID,
                (err, data) => {
                    if (err) {
                        console.error("Error sending message:", err);
                    } else {
                        global.client.handleReply.push({
                            name: this.config.name,
                            author: event.senderID,
                            messageID: data.messageID,
                            nameUser,
                            uidUser,
                            type: 'reply'
                        });
                    }
                }
            );
        } catch (e) {
            console.error("Error in onStart:", e);
            return api.sendMessage("An error occurred while fetching friends list. Please try again.", event.threadID);
        }
    }
};