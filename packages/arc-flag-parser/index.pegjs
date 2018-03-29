Start
  = result:Expression {
    if (!Array.isArray(result[0])) {
      result = [result]
    }
    return result;
  }

Expression
  = head:Term tail:((",") Term)* {
      return tail.reduce(function(result, element) {
        if (!Array.isArray(result[0])) {
          result = [result]
        }
        if (Array.isArray(element[1][0])) {
          result.push.apply(result, element[1]);
        } else {
          result.push(element[1]);
        }
        return result;
      }, head);
    }

Term
  = head:Factor tail:(("+") Factor)* {
      return tail.reduce(function(result, element) {
        if (Array.isArray(result[0])) {
          let next = []
          element[1].forEach(flag => {
            result.forEach(r => next.push(r.concat(flag)));
          });
          return next;
        } else {
          return element[1].map(flag => {
            return result.concat(flag);
          });
        }
      }, head);
    }

Factor
  = "[" expr:Expression "]" { return expr; }
  / Flag

Flag
  = [a-z\_\-A-Z0-9]+ { return [text()]; }