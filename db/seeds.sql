INSERT INTO department (name)
VALUES ("Sales"),
       ( "Finance"),
       ( "Legal"),
       ( "Engineering");

INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
       ( "Salesperson", 80000, 1),
       ( "Lead Engineer", 150000, 4),
       ( "Software Engineer", 120000, 4),
       ( "Account Manager", 160000, 2),
       ( "Accountant", 125000, 2),
       ( "Legal Team Lead", 250000, 3),
       ( "Lawyer", 190000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1 ),
       ( "Mike", "Chan", 2, 1),
       ( "Ashley", "Rodriguez", 3),
       ( "Kevin", "Tupik", 4, 3),
       ( "Kunal", "Singh", 5),
       ( "Malia", "Brown", 6, 5),
       ( "Sarah", "Lourd", 7),
       ( "Tom", "Allen", 8, 7)