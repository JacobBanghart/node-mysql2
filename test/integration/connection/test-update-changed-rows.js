/**
 * <plusmancn@gmail.com> created at 2016.09.17 15:24:34
 *
 * issue#288: https://github.com/sidorares/node-mysql2/issues/288
 */
var common = require('../../common');
var connection = common.createConnection();
var assert = require('assert');

var result1 = undefined;
var result2 = undefined;

// connection.
connection.query(
  [
    'CREATE TEMPORARY TABLE `changed_rows` (',
    '`id` int(11) unsigned NOT NULL AUTO_INCREMENT,',
    '`value` int(5) NOT NULL,',
    'PRIMARY KEY (`id`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
  ].join('\n')
);
connection.query('insert into changed_rows(value) values(1)');
connection.query('insert into changed_rows(value) values(1)');
connection.query('insert into changed_rows(value) values(2)');
connection.query('insert into changed_rows(value) values(3)');

connection.execute('update changed_rows set value=1', [], function(
  err,
  _result
) {
  if (err) {
    throw err;
  }

  result1 = _result;
  connection.execute('update changed_rows set value=1', [], function(
    err,
    _result
  ) {
    if (err) {
      throw err;
    }

    result2 = _result;
    connection.end();
  });
});

process.on('exit', function() {
  assert.equal(result1.affectedRows, 4);
  assert.equal(result1.changedRows, 2);
  assert.equal(result2.affectedRows, 4);
  assert.equal(result2.changedRows, 0);
});
