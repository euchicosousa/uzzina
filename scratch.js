const { Extension } = require('@tiptap/core');
const StarterKit = require('@tiptap/starter-kit').default;
const extensions = StarterKit.configure({}).config.addExtensions();
console.log("StarterKit extensions:", extensions.map(e => e.name));
