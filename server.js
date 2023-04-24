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
    // TODO: Add MySQL password here
    password: 'Miller1676$$',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

const addDepartment = [{
  type: 'input',
  name: 'addDepartment',
  message: 'What is the name of the department?'
}]



const addEmployee = [{

  type: 'input',
  name: 'employeeFirstName',
  message: "What is the employee's first name?"
},
{
  type: 'input',
  name: 'employeeLastName',
  message: "What is the employee's last name?"
},

]


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


const questions = () => {
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

  inquirer
    .prompt(homePage)
    .then((response) => {
      if (response.homepage === 'View All Employees') {
        const sql = "Select a.id, a.first_name, a.last_name, r.title AS title, d.name AS department, r.salary AS salary, concat(b.first_name,' ', b.last_name) as manager from employee a left join employee b ON (a.manager_id = b.id) join role r ON (a.role_id = r.id) join department d ON (r.department_id = d.id)"
        db.query(sql, function (err, results) {
          console.table(results)
          if (err) {
            results.status(500).json({ error: err.message });
          }
          return questions();
        });
      }
      else if (response.homepage === 'Add Employee') {
        inquirer
        .prompt(addEmployee)
        .then((response => {
          const arr = [response.employeeFirstName, response.employeeLastName]

          db.query('SELECT * FROM role', (err, res) => {
            const roles = res.map(({id, title}) => ({name: title, value: id}))
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
              const role = response.employeeRole
              arr.push(role)
              db.query("SELECT id, concat(first_name,' ',last_name) AS name FROM employee WHERE manager_id IS NULL;", (err, res) => {
                const managers = res.map(({name, id}) => ({ name: name, value: id}))
                inquirer
                .prompt([
                  {
                    type: 'list', 
                    message: 'Who is the employees manager',
                    name: 'employeeManager',
                    choices: managers
                  }
                ])
                .then( response => {
                  const manager = response.employeeManager
                  arr.push(manager)
                  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`, arr, function(err, results) {
                    if(err) {
                      response.status(500).json({ error: err.message });
                    }
                     console.log(`Added employee to the database`);
                    return questions();
                  })
                })
              })
            })
          })
        }))

      }
      else if (response.homepage === 'Update Employee Role') {

      }
      else if (response.homepage === 'View All Roles') {
        const sql = 'SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary FROM role JOIN department ON role.department_id = department.id'
        db.query(sql, function (err, results) {
          console.table(results)
          if (err) {
            results.status(500).json({ error: err.message });
          }
          return questions();
        });
      }
      else if (response.homepage === 'Add Role') {
        inquirer
          .prompt(addRole)
          .then((response => {
            const arr = [response.roleName, response.roleSalary]

            db.query('SELECT * FROM department', (err, res) => {
              const dep = res.map(( { id, name }) => ({name: name, value: id }))
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
                  const department = response.roleDepartment
                  arr.push(department);
                  db.query(`INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`, arr, function(err, results) {
                    if(err) {
                      response.status(500).json({ error: err.message });
                    }
                     console.log(`Added role to the database`);
                    return questions();
                  })
                })
            })
          }))
      }
      else if (response.homepage === 'View All Departments') {
        db.query('SELECT * FROM department', function (err, results) {
          console.table(results)
          if (err) {
            results.status(500).json({ error: err.message });
          }
          return questions();
        })
      }
      else if (response.homepage === 'Add Department') {
        inquirer
          .prompt(addDepartment)
          .then((response) => {
            const sql = `INSERT INTO department (name) VALUES (?)`
            const vaules = [response.addDepartment];
            db.query(sql, vaules, function (err, results) {
              if (err) {
                results.status(500).json({ error: err.message });
              }
              console.log(`Added ${response.addDepartment} to the database`);
              return questions();
            })
          })
      }
      else if (response.homepage === 'Quit') {
        process.exit(app)
      };

    });

};




questions();




// Connect to the database before starting the Express.js server
app.listen(PORT, () => console.log('Now listening'));
