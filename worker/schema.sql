CREATE SCHEMA IF NOT EXISTS pousada_bot;
CREATE TABLE IF NOT EXISTS pousada_bot.messages (
  chat_key text NOT NULL,
  message_id text NOT NULL,
  stream text NOT NULL CHECK (stream IN ('guest', 'bookings')),
  direction text NOT NULL CHECK (direction IN ('in', 'out')),
  occurred_at timestamptz NOT NULL,
  payload text NOT NULL,
  PRIMARY KEY (chat_key, message_id)
);
CREATE TABLE IF NOT EXISTS pousada_bot.booking_notes (
  chat_key text NOT NULL,
  message_id text NOT NULL,
  starts_on date,
  ends_on date,
  unit text,
  review_reason text NOT NULL,
  PRIMARY KEY (chat_key, message_id),
  FOREIGN KEY (chat_key, message_id) REFERENCES pousada_bot.messages
);
CREATE TABLE IF NOT EXISTS pousada_bot.drafts (
  chat_key text NOT NULL,
  message_id text NOT NULL,
  body text NOT NULL,
  state text NOT NULL CHECK (state IN ('draft', 'review')),
  PRIMARY KEY (chat_key, message_id),
  FOREIGN KEY (chat_key, message_id) REFERENCES pousada_bot.messages
);
