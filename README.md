# Discord Channel Archive

This is a JSON based file format, design to store discord channel contents.
Ideally this is stored as a BSON file to reduce file size, but regular JSON is also supported.
This repository contains a description of the file structure, as well as an
<a href="https://developertk.github.io/discord-channel-archive/webview/index.html">html viewer</a>,
that displays channel archives in a human-readable way.

## JSON Format

### Global Fields

| Field | Description | Datatype | 
| --- | --- | --- |
| name | Discord channel name | String |
| id | Discord channel id | String (Snowflake[1]) |
| topic | Discord channel topic | String |
| roles | all sorted roles relevant to this scope | Object |
| userdata | all users who author at least one message in this archive | Object |
| messages | all archived message | Array |

### Roles Fields

| Field | Description | Datatype | 
| --- | --- | --- |
| (object key) | Discord role id | String (Snowflake[1]) |
| color | RGB color (hex values) | Integer |
| name | role display name | String |

### Userdata Fields

| Field | Description | Datatype | 
| --- | --- | --- |
| (object key) | Discord user id | String (Snowflake[1]) |
| lastAvatar | avatar URL* | String |
| lastNickname | guild nickname* | String (URL) |
| lastUsername | Discord username* | String |
| lastTag | Discord user tag* | Integer |
| topRole | top grouped Discord role* | String (Snowflake[1]) |
| userType | 0: user, 1: bot, 2: webhook | String (Snowflake[1]) |

*: as of the archive creation time

### Messages Fields

| Field | Description | Datatype | 
| --- | --- | --- |
| id | Discord message id | String (Snowflake[1]) |
| author | Discord user id of the message author | String (Snowflake[1]) |
| content | text contents of the message | String |
| embeds | all embeds attached to this message | Array(DiscordEmbed[2]) |
| attachments | all attached media URLS | Array(String) |

```json5
{
  "name": "cool-channel",
  "id": "86913608335773696",
  "topic": "This channel is for cool people only",
  "roles": {
    "419085713049855234": {
      "color": 0,
      "name": "cool people"
    }
  },
  "userdata": {
    "237593967137390592": {
      "lastAvatar": "https://cdn.discordapp.com/avatars/237593967137390592/15094bba719a7dc06de49efa81fe2ce9.webp",
      "lastNickname": "Christian",
      "lastUsername": "TK",
      "lastTag": 7340,
      "topRole": "419085713049855234",
      "userType": 0
    }
  },
  "messages": [
    {
      "id": "749116083357736960",
      "author": "237593967137390592",
      "content": "Hello :)",
      "embeds": [],
      "attachments": ["https://cdn.discordapp.com/attachments/494194782198038565/694722200531632198/220px-Blue_rectangle.png"]
    }
  ]
}
```

[1]: https://discord.com/developers/docs/reference#snowflakes
[2]: https://discord.com/developers/docs/resources/channel#embed-object
