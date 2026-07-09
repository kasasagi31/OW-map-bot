const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { createUserSelectRow } = require("../components/userSelect");

function createEventCreateModal() {
  const modal = new ModalBuilder()
    .setCustomId("event_create_modal")
    .setTitle("募集作成");

  const titleInput = new TextInputBuilder()
    .setCustomId("event_title")
    .setLabel("タイトル")
    .setPlaceholder("例：OWカスタム、VRC雑談")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId("event_time")
    .setLabel("開始予定")
    .setPlaceholder("例：21:00")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const maxInput = new TextInputBuilder()
    .setCustomId("event_max")
    .setLabel("募集人数 空欄なら制限なし")
    .setPlaceholder("例：10")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(maxInput)
  );

  return modal;
}

function createNotifyRow(encodedData) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`event_notify_yes:${encodedData}`)
      .setLabel("@everyoneする")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`event_notify_no:${encodedData}`)
      .setLabel("しない")
      .setStyle(ButtonStyle.Secondary)
  );
}

function createEventDescription(event) {
  const joined = event.joined || [];
  const late = event.late || [];

  const peopleText = event.max
    ? `👥 ${joined.length + late.length} / ${event.max}人`
    : `👥 ${joined.length + late.length}人`;

  return (
    `🕒 開始予定\n${event.time}頃\n\n` +
    `${peopleText}\n\n` +
    `🟩 参加（${joined.length}）\n${
      joined.length ? joined.map((name) => `・${name}`).join("\n") : "なし"
    }\n\n` +
    `🟨 途中参加（${late.length}）\n${
      late.length ? late.map((name) => `・${name}`).join("\n") : "なし"
    }`
  );
}

function createEventEmbed(event) {
  return new EmbedBuilder()
    .setTitle(`🎮 ${event.title}`)
    .setDescription(createEventDescription(event))
    .setColor(0x57f287);
}

function createJoinRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("event_join")
      .setLabel("参加")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("event_late")
      .setLabel("途中参加")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("event_manage")
      .setLabel("参加者管理")
      .setEmoji("👥")
      .setStyle(ButtonStyle.Primary)
  );
}

function createParticipantUserSelectRow(messageId) {
  return createUserSelectRow(
    "event_remove",
    messageId,
    "外す人を選んでね"
  );
}
function disableRows(rows) {
  return rows.map((row) => {
    const newRow = ActionRowBuilder.from(row);

    newRow.components = newRow.components.map((component) => {
      if (component.data.type === 2) {
        return ButtonBuilder.from(component).setDisabled(true);
      }

      return component;
    });

    return newRow;
  });
}

module.exports = {
  createEventCreateModal,
  createNotifyRow,
  createEventDescription,
  createEventEmbed,
  createJoinRow,
  createParticipantUserSelectRow,
  disableRows,
};