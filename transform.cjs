module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let dirty = false;

  root
    .find(j.ExportNamedDeclaration, {
      declaration: {
        type: "VariableDeclaration",
        kind: "const",
      },
    })
    .forEach((path) => {
      const decls = path.node.declaration.declarations;
      if (decls.length === 1 && decls[0].id.type === "Identifier") {
        const name = decls[0].id.name;
        // Only target PascalCase exports (likely React components)
        if (
          /^[A-Z]/.test(name) &&
          decls[0].init &&
          decls[0].init.type === "ArrowFunctionExpression"
        ) {
          const arrowFunc = decls[0].init;

          let body = arrowFunc.body;
          // If it's an expression like () => <div />, we need to wrap it in a return statement and BlockStatement
          if (body.type !== "BlockStatement") {
            body = j.blockStatement([j.returnStatement(body)]);
          }

          const funcDecl = j.functionDeclaration(
            j.identifier(name),
            arrowFunc.params,
            body,
          );

          // Copy return type annotation if it exists
          if (arrowFunc.returnType) {
            funcDecl.returnType = arrowFunc.returnType;
          }

          // Copy type parameters if it exists (e.g. <T>)
          if (arrowFunc.typeParameters) {
            funcDecl.typeParameters = arrowFunc.typeParameters;
          }

          // Replace the VariableDeclaration with the FunctionDeclaration
          path.node.declaration = funcDecl;
          dirty = true;
        }
      }
    });

  return dirty ? root.toSource() : null;
};
module.exports.parser = "tsx";
