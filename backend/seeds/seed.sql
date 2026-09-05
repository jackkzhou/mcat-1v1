TRUNCATE answer_choices, questions, passages RESTART IDENTITY CASCADE;

INSERT INTO passages (passage_text, category) VALUES
  ('Enzyme kinetics passage text here...', 'Bio/Biochem');

INSERT INTO questions (passage_id, question_text) VALUES
  (1, 'Which best explains the observed rate change?'),
  (1, 'What is the role of the cofactor described?');

INSERT INTO answer_choices (question_id, choice_text, is_correct) VALUES
  (1, 'Competitive inhibition', true),
  (1, 'Noncompetitive inhibition', false),
  (1, 'Allosteric activation', false),
  (1, 'Substrate depletion', false),
  (2, 'It stabilizes the transition state', true),
  (2, 'It denatures the enzyme', false),
  (2, 'It blocks the active site', false),
  (2, 'It has no effect', false);