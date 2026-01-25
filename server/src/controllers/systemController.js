import SystemSettings from "../models/SystemSettingsModel.js";

/* Feedback ON / OFF */
export const setFeedbackStatus = async (req, res) => {
  await SystemSettings.findOneAndUpdate(
    { key: "feedback_active" },
    { value: req.body.value },
    { upsert: true }
  );
  res.json({ success: true });
};

export const getFeedbackStatus = async (req, res) => {
  const setting = await SystemSettings.findOne({ key: "feedback_active" });
  res.json({ active: setting?.value || false });
};

/* Feedback Session */
export const setFeedbackSession = async (req, res) => {
  const { session } = req.body;

  await SystemSettings.findOneAndUpdate(
    { key: "feedback_session" },
    { value: session },
    { upsert: true }
  );

  res.json({ success: true });
};

export const getFeedbackSession = async (req, res) => {
  const setting = await SystemSettings.findOne({ key: "feedback_session" });
  res.json({ session: setting?.value || null });
};