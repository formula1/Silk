
exports.defineTags = function(dictionary) {
  dictionary.defineTag("implementation", {
    isNamespace: true,
    onTagged: function(doclet, tag) {
      doclet.implementation = tag.value;
      doclet.addTag('kind', 'implementation');
      if (tag.value && tag.value.description) { // as in a long tag
        doclet.addTag( 'name', tag.value.description);
      }
      else if (tag.text) { // or a short tag
        doclet.addTag('name', tag.text);
      }
    }
  });
}
