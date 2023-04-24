

function selectDepartments (){
db.query('SELECT * FROM department', function (err, results) {
    console.log(results)
    if (err){
      res.status(500).json({ error: err.message});
      return;
    }

    res.json({
      message: 'success',
      data: results
    });
  })
}


function selectRoles(db, res){
  
db.query('SELECT * FROM role', function (err, results) {
    console.log(results)
    if (err){
      res.status(500).json({ error: err.message});
      return;
    }

    res.json({
      message: 'success',
      data: results
    });
  })
  
}
function selectEmployees(){
db.query("Select a.id, a.first_name, a.last_name, r.title AS title, d.name AS department, r.salary AS salary, concat(b.first_name,' ', b.last_name) as Manager from employee a left join employee b ON (a.manager_id = b.id) join role r ON (a.role_id = r.id) join department d ON (r.department_id = d.id)"
, function (err, results) {
    console.log(results)
    if (err){
      res.status(500).json({ error: err.message});
      return;
    }

    res.json({
      message: 'success',
      data: results
    });
  })


}




module.exports = {selectRoles, selectEmployees, selectDepartments};