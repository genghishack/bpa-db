const seq = 1.200;
const label = 'create state lookup table';

export default {
  seq, label, sql: `
        DROP TABLE IF EXISTS layer_mgt.state;
    CREATE TABLE
        layer_mgt.state
    (
        st_code INTEGER NOT NULL,
        NAME    CHARACTER VARYING(40),
        abbrev  CHARACTER VARYING(3),
        statefp CHARACTER(2),
        PRIMARY KEY (st_code),
        UNIQUE (statefp),
        UNIQUE (abbrev),
        UNIQUE (NAME)
    );

    INSERT INTO layer_mgt.state (st_code, name, abbrev, statefp)
    VALUES (1, 'Alabama', 'AL', '01'),
           (2, 'Alaska', 'AK', '02'),
           (60, 'American Samoa', 'AS', '60'),
           (4, 'Arizona', 'AZ', '04'),
           (5, 'Arkansas', 'AR', '05'),
           (6, 'California', 'CA', '06'),
           (8, 'Colorado', 'CO', '08'),
           (9, 'Connecticut', 'CT', '09'),
           (10, 'Delaware', 'DE', '10'),
           (11, 'District of Columbia', 'DC', '11'),
           (64, 'Federated States of Micronesia', 'FM', '64'),
           (12, 'Florida', 'FL', '12'),
           (13, 'Georgia', 'GA', '13'),
           (66, 'Guam', 'GU', '66'),
           (15, 'Hawaii', 'HI', '15'),
           (16, 'Idaho', 'ID', '16'),
           (17, 'Illinois', 'IL', '17'),
           (18, 'Indiana', 'IN', '18'),
           (19, 'Iowa', 'IA', '19'),
           (20, 'Kansas', 'KS', '20'),
           (21, 'Kentucky', 'KY', '21'),
           (22, 'Louisiana', 'LA', '22'),
           (23, 'Maine', 'ME', '23'),
           (68, 'Marshall Islands', 'MH', '68'),
           (24, 'Maryland', 'MD', '24'),
           (25, 'Massachusetts', 'MA', '25'),
           (26, 'Michigan', 'MI', '26'),
           (27, 'Minnesota', 'MN', '27'),
           (28, 'Mississippi', 'MS', '28'),
           (29, 'Missouri', 'MO', '29'),
           (30, 'Montana', 'MT', '30'),
           (31, 'Nebraska', 'NE', '31'),
           (32, 'Nevada', 'NV', '32'),
           (33, 'New Hampshire', 'NH', '33'),
           (34, 'New Jersey', 'NJ', '34'),
           (35, 'New Mexico', 'NM', '35'),
           (36, 'New York', 'NY', '36'),
           (37, 'North Carolina', 'NC', '37'),
           (38, 'North Dakota', 'ND', '38'),
           (69, 'Northern Mariana Islands', 'MP', '69'),
           (39, 'Ohio', 'OH', '39'),
           (40, 'Oklahoma', 'OK', '40'),
           (41, 'Oregon', 'OR', '41'),
           (70, 'Palau', 'PW', '70'),
           (42, 'Pennsylvania', 'PA', '42'),
           (72, 'Puerto Rico', 'PR', '72'),
           (44, 'Rhode Island', 'RI', '44'),
           (45, 'South Carolina', 'SC', '45'),
           (46, 'South Dakota', 'SD', '46'),
           (47, 'Tennessee', 'TN', '47'),
           (48, 'Texas', 'TX', '48'),
           (49, 'Utah', 'UT', '49'),
           (50, 'Vermont', 'VT', '50'),
           (78, 'Virgin Islands', 'VI', '78'),
           (51, 'Virginia', 'VA', '51'),
           (53, 'Washington', 'WA', '53'),
           (54, 'West Virginia', 'WV', '54'),
           (55, 'Wisconsin', 'WI', '55'),
           (56, 'Wyoming', 'WY', '56'),
           (0, 'Continental United States', 'CUS', '00');
  `
};
