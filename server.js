const express = require('express');
const cTable = require('console.table');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'Miller1676$$',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);


// variable containing the inquirer prompt for Add Department 
const addDepartment = [{
  type: 'input',
  name: 'addDepartment',
  message: 'What is the name of the department?'
}]


// variable containing the inquirer prompt for Add Employee 
const addEmployee = [{

  type: 'input',
  name: 'employeeFirstName',
  message: "What is the employee's first name?"
},
{
  type: 'input',
  name: 'employeeLastName',
  message: "What is the employee's last name?"
}]
// variable containing the inquirer prompt for Add Role
const addRole = [{
  type: 'input',
  name: 'roleName',
  message: 'What is the name of the role?'
},
{
  type: 'input',
  name: 'roleSalary',
  message: 'What is the salary of the role?'
},
]

// questions function that holds all the inquirer prompts and responses
const questions = () => {
  // homepage variable that holds the inquirer prompt for the main list of questions
  const homePage = [{
    type: 'list',
    name: 'homepage',
    message: 'What would you like to do?',
    choices: [
      { title: 'View All Employees', value: 'View All Employees' },
      { title: 'Add Employee', value: 'Add Employee' },
      { title: 'Update Employee Role', value: 'Update Employee Role' },
      { title: 'View All Roles', value: 'View All Roles' },
      { title: 'Add Role', value: 'Add Role' },
      { title: 'View All Departments', value: 'View All Departments' },
      { title: 'Add Department', value: 'Add Department' },
      { title: 'Quit', value: 'Quit' }
    ],
    initial: 1
  }]
// Inqiurer prompt that starts the questions 
  inquirer
    .prompt(homePage)
    .then((response) => {
      // If statement for if the user selects View All Employees
      if (response.homepage === 'View All Employees') {
        // sql query that gets all the the employees and tables the results
        const sql = "Select a.id, a.first_name, a.last_name, r.title AS title, d.name AS department, r.salary AS salary, concat(b.first_name,' ', b.last_name) as manager from employee a left join employee b ON (a.manager_id = b.id) join role r ON (a.role_id = r.id) join department d ON (r.department_id = d.id)"
        db.query(sql, function (err, results) {
          console.table(results)
          if (err) {
            results.status(500).json({ error: err.message });
          }
          // returns the function question to start over function
          return questions();
        });
      }
       // If statement for if the user selects Add Employee
      else if (response.homepage === 'Add Employee') {
        // Inquirer for the addEmployee prompts
        inquirer
          .prompt(addEmployee)
          .then((response => {
            // stores responses in an array
            const arr = [response.employeeFirstName, response.employeeLastName]
            // Gets all roles
            db.query('SELECT * FROM role', (err, res) => {
              // Prompts user with the roles table using id and title
              const roles = res.map(({ id, title }) => ({ name: title, value: id }))
              inquirer
                .prompt([
                  {
                    type: 'list',
                    message: 'What is the employees role?',
                    name: 'employeeRole',
                    choices: roles
                  }
                ])
                .then(response => {
                  // Pushes response into the array containing other responses
                  const role = response.employeeRole
                  arr.push(role)
                  // gets all managers
                  db.query("SELECT id, concat(first_name,' ',last_name) AS name FROM employee WHERE manager_id IS NULL;", (err, res) => {
                    // Prompts user with the managers using the name and id
                    const managers = res.map(({ name, id }) => ({ name: name, value: id }))
                    inquirer
                      .prompt([
                        {
                          type: 'list',
                          message: 'Who is the employees manager',
                          name: 'employeeManager',
                          choices: managers
                        }
                      ])
                      .then(response => {
                        // Pushes response into the array containing other responses
                        const manager = response.employeeManager
                        arr.push(manager)
                        // Adds new employee to the employee table
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`, arr, function (err, results) {
                          if (err) {
                            response.status(500).json({ error: err.message });
                          }
                          
                          // returns the function question to start over function
                          console.log(`Added ${arr[0]} ${arr[1]} to the database`);
                          return questions();
                        });
                        
                      });
                      
                  });
                });
            });
            
          }));

      }
       // If statement for if the user selects View All Employees
      else if (response.homepage === 'Update Employee Role') {
        // Gets all employees by id and name
        db.query("SELECT id, concat(first_name,' ',last_name) AS name FROM employee", (err, res) => {
          const employees = res.map(({id, name}) => ({name: name, value: id}))
          // Creates an empty array
          const arr =[];
          // Prompts user with the employees table 
          inquirer 
          .prompt([
            {
              type: 'list',
              message: "Which employees role do you want to update?",
              name: 'employeeUpdate',
              choices: employees
            }
          ])
          .then(response => {
            // Pushes response into the array containing other responses
            const employeeUpdate = response.employeeUpdate
            arr.push(employeeUpdate)
            // Gets all from role table
            db.query('SELECT * FROM role', (err, res) => {
              const roles = res.map(({ id, title }) => ({ name: title, value: id }))
              // prompts user with the roles table
              inquirer
              .prompt([
                {
                  type: 'list',
                  message: 'Which role do you want to assign the selected employee?',
                  name: 'employeeRoleUpdate',
                  choices: roles
                }
              ])
              .then(response => {
                // Pushes response into the array containing other responses
                const role = response.employeeRoleUpdate
                arr.push(role)
                // Changes the order of reesponses in the array to match query
                let employeeUpdate = arr[0]
                arr[0] = role
                arr[1] = employeeUpdate
                // Updates employee role using employee id
                db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, arr, function (err, results) {
                  if (err) {
                    response.status(500).json({ error: err.message });
                  }
                  console.log(`Updated employees's role`);
                  // returns the function question to start over function
                  return questions();
                });
              });
            });
          });
        });

      }
       // If statement for if the user selects View All Employees
      else if (response.homepage === 'View All Roles') {
        // Gets all from role table 
        const sql = 'SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary FROM role JOIN department ON role.department_id = department.id'
        db.query(sql, function (err, results) {
          console.table(results)
          if (err) {
            results.status(500).json({ error: err.message });
          }
          // returns the function question to start over function
          return questions();
        });
      }
       // If statement for if the user selects View All Employees
      else if (response.homepage === 'Add Role') {
        inquirer
          .prompt(addRole)
          .then((response => {
            // creates an array with the responses
            const arr = [response.roleName, response.roleSalary]
            // get all departments
            db.query('SELECT * FROM department', (err, res) => {
              const dep = res.map(({ id, name }) => ({ name: name, value: id }))
              inquirer
                .prompt([
                  {
                    type: 'list',
                    message: 'Choose a department',
                    name: 'roleDepartment',
                    choices: dep
                  }
                ])
                .then(response => {
                  // Pushes response into the array containing other responses
                  const department = response.roleDepartment
                  arr.push(department);
                  // adds new role into role table
                  db.query(`INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`, arr, function (err, results) {
                    if (err) {
                      response.status(500).json({ error: err.message });
                    }
                    console.log(`Added ${arr[0]} to the database`);
                    // returns the function question to start over function
                    return questions();
                  })
                })
            })
          }))
      }
       // If statement for if the user selects View All Employees
      else if (response.homepage === 'View All Departments') {
        db.query('SELECT * FROM department', function (err, results) {
          console.table(results)
          if (err) {
            results.status(500).json({ error: err.message });
          }
          // returns the function question to start over function
          return questions();
        })
      }
       // If statement for if the user selects View All Employees
      else if (response.homepage === 'Add Department') {
        inquirer
          .prompt(addDepartment)
          .then((response) => {
            // adds new department into department able
            const sql = `INSERT INTO department (name) VALUES (?)`
            const vaules = [response.addDepartment];
            db.query(sql, vaules, function (err, results) {
              if (err) {
                results.status(500).json({ error: err.message });
              }
              console.log(`Added ${response.addDepartment} to the database`);
              // returns the function question to start over function
              return questions();
            })
          })
      } // If statement for if the user selects View All Employees
      else if (response.homepage === 'Quit') {
        process.exit(app)
      };

    });

};
// Calls the function containing inquirer prompts
questions();


// Connect to the database before starting the Express.js server
app.listen(PORT, () => console.log('Now listening'));
