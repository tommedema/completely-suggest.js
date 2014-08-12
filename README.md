complete.ly
===========

A javascript library for autocompletion

Changelog compared to original repo:
- New classes for html elements (completely-wrapper, completely-prompt, completely-input, completely-hint, completely-dropdown)
- Now it can be possible to add autocomplete feature also directly to existing input elements

Changelog compared to forked repo:
- Project is focused on providing suggestions, even when no input has been entered yet.
  > hide autocomplete box by default if input is not focused
  > show autocomplete box on focus, hide on blur
- Case insensitive matching
- Cross browser (with HTML5 and ES5 polyfills IE8+)