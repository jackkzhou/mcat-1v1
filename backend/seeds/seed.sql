TRUNCATE answer_choices, questions, passages RESTART IDENTITY CASCADE;

INSERT INTO passages (passage_text, category) VALUES
  ('Researchers characterized a purified hydrolase using initial-velocity measurements across a range of substrate concentrations. In the absence of inhibitor the enzyme followed Michaelis-Menten kinetics with Vmax = 100 umol/min and Km = 2.0 mM. Three compounds were then tested. Compound X raised the apparent Km to 8.0 mM while leaving Vmax unchanged. Compound Y lowered Vmax to 40 umol/min while leaving Km unchanged. Compound Z, which binds at a site distant from the active site, lowered both Vmax and Km by the same factor. A separate experiment replaced an active-site histidine with alanine; the resulting mutant showed no measurable activity, but its circular dichroism spectrum was indistinguishable from that of the wild-type enzyme.', 'Bio/Biochem'),
  ('A student titrated 25.0 mL of 0.100 M acetic acid (Ka = 1.8 x 10^-5) with 0.100 M NaOH, recording pH continuously with a calibrated electrode. The resulting curve showed a gradual plateau at intermediate volumes followed by a steep rise near 25.0 mL of added titrant. The student then repeated the procedure with 25.0 mL of 0.100 M HCl at the same titrant concentration. Both titrations were performed in a coffee-cup calorimeter, and the temperature change was recorded. The heat released per mole of base added was measurably smaller in the acetic acid trial than in the HCl trial.', 'Chem/Phys');

INSERT INTO questions (passage_id, question_text) VALUES
  (1, 'Compound X most likely acts as which type of inhibitor?'),
  (1, 'Compound Y lowers Vmax without changing Km. This is most consistent with:'),
  (1, 'Compound Z binds distant from the active site and lowers both Vmax and Km. This behavior is characteristic of:'),
  (1, 'The His-to-Ala mutant is inactive but retains its circular dichroism spectrum. This best supports which conclusion?'),
  (1, 'In the uninhibited reaction, at [S] = 2.0 mM the initial velocity is closest to:'),
  (2, 'At the half-equivalence point of the acetic acid titration, the pH is closest to:'),
  (2, 'Which species pair is primarily responsible for the buffering region of the acetic acid curve?'),
  (2, 'At the equivalence point of the acetic acid titration, the solution pH is:'),
  (2, 'Compared with the acetic acid trial, the HCl titration curve would show:'),
  (2, 'The smaller heat released per mole in the acetic acid trial is best explained by:');

INSERT INTO answer_choices (question_id, choice_text, is_correct) VALUES
  (1, 'A competitive inhibitor', true),
  (1, 'A noncompetitive inhibitor', false),
  (1, 'An uncompetitive inhibitor', false),
  (1, 'An irreversible covalent inhibitor', false),

  (2, 'Noncompetitive inhibition', true),
  (2, 'Competitive inhibition', false),
  (2, 'Substrate depletion', false),
  (2, 'Allosteric activation', false),

  (3, 'Uncompetitive inhibition', true),
  (3, 'Competitive inhibition', false),
  (3, 'Irreversible inhibition', false),
  (3, 'Substrate channeling', false),

  (4, 'The histidine participates in catalysis rather than maintaining the fold', true),
  (4, 'The mutation caused the enzyme to unfold completely', false),
  (4, 'The histidine is required only for substrate binding affinity', false),
  (4, 'The mutant enzyme aggregated and precipitated from solution', false),

  (5, '50 umol/min', true),
  (5, '100 umol/min', false),
  (5, '25 umol/min', false),
  (5, '80 umol/min', false),

  (6, '4.74', true),
  (6, '7.00', false),
  (6, '2.87', false),
  (6, '8.72', false),

  (7, 'Acetic acid and acetate ion', true),
  (7, 'Acetate ion and hydroxide ion', false),
  (7, 'Acetic acid and hydronium ion', false),
  (7, 'Sodium ion and acetate ion', false),

  (8, 'Greater than 7, because acetate hydrolyzes to produce hydroxide', true),
  (8, 'Exactly 7, because equal moles of acid and base have reacted', false),
  (8, 'Less than 7, because excess acetic acid remains', false),
  (8, 'Less than 7, because sodium ion is weakly acidic', false),

  (9, 'A lower initial pH and no buffering plateau', true),
  (9, 'A higher initial pH and a longer buffering plateau', false),
  (9, 'An equivalence point at a pH above 7', false),
  (9, 'An equivalence point at a larger titrant volume', false),

  (10, 'Some energy is consumed ionizing the weak acid before neutralization', true),
  (10, 'Acetic acid has a smaller heat capacity than hydrochloric acid', false),
  (10, 'Fewer moles of water are produced in the acetic acid reaction', false),
  (10, 'The acetic acid reaction does not reach completion at any point', false);
