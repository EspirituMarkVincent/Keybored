const rows = [
  //row 1
  [
    {label: 'Esc', key: 'Escape'},
    {label: '1', key: ['1', '!']},
    {label: '2', key: ['2', '@']},
    {label: '3', key: ['3', '#']},
    {label: '4', key: ['4', '$']},
    {label: '5', key: ['5', '%']},
    {label: '6', key: ['6', '^']},
    {label: '7', key: ['7', '&']},
    {label: '8', key: ['8', '*']},
    {label: '9', key: ['9', '(']},
    {label: '0', key: ['0', ')']},
    {label: '-', key: ['-', '_']},
    {label: '=', key: ['=', '+']},
    {label: 'Backspace', key: 'Backspace'}
  ],
  //row 2
  [
    {label: 'Tab', key: '\t'},
    {label: 'Q', key: ['q', 'Q']},
    {label: 'W', key: ['w', 'W']},
    {label: 'E', key: ['e', 'E']},
    {label: 'R', key: ['r', 'R']},
    {label: 'T', key: ['t', 'T']},
    {label: 'Y', key: ['y', 'Y']},
    {label: 'U', key: ['u', 'U']},
    {label: 'I', key: ['i', 'I']},
    {label: 'O', key: ['o', 'O']},
    {label: 'P', key: ['p', 'P']},
    {label: '[ {', key: ['[', '{']},
    {label: '] }', key: [']', '}']},
    {label: '\\ |', key: ['\\', '|']}
  ],
  //row 3
  [
    {label: 'Caps', key: 'CapsLock'},
    {label: 'A', key: ['a', 'A']},
    {label: 'S', key: ['s', 'S']},
    {label: 'D', key: ['d', 'D']},
    {label: 'F', key: ['f', 'F']},
    {label: 'G', key: ['g', 'G']},
    {label: 'H', key: ['h', 'H']},
    {label: 'J', key: ['j', 'J'],},
    {label: 'K', key: ['k', 'K'], },
    {label: 'L', key: ['l', 'L']},
    {label: '; :', key: [';', ':']},
    {label: "\" '", key: ['"', "'"]},
    {label: 'Enter', key: 'Enter'}
  ],
  //row 4
  [
    {label: 'Shift', key: 'ShiftLeft'},
    {label: 'Z', key: ['z', 'Z']},
    {label: 'X', key: ['x', 'X']},
    {label: 'C', key: ['c', 'C']},
    {label: 'V', key: ['v', 'V']},
    {label: 'B', key: ['b', 'B']},
    {label: 'N', key: ['n', 'N']},
    {label: 'M', key: ['m', 'M']},
    {label: ', <', key: [',', '<']},
    {label: '. >', key: ['.', '>']},
    {label: '/ ?', key: ['/', '?']},
    {label: 'Shift', key: 'ShiftRight'}
  ],
  //row 5
  [
    {label: 'Ctrl', key: 'Control'},
    {label: 'Win', key: 'Meta'},
    {label: 'Alt', key: 'Alt'},
    {label: 'Space', key: ' '},
    {label: 'Alt', key: 'Alt'},
    {label: 'Fn', key: 'Fn'},
    {label: 'Menu', key: 'ContextMenu'},
    {label: 'Ctrl', key: 'Control'}
  ]
]

function setKeySize(key) {
  if (key.key === '\t') {
    return { size: '100px' };
  } else if (key.key === ' ') {
    return { size: '470px' };
  } else if (key.key === 'ShiftRight') {
    return { size: '180px' };
  } else if (key.key === 'ShiftLeft') {
    return { size: '160px'};
  } else if (key.key === 'Backspace') {
    return { size: '150px' };
  } else if (key.key === '\\') {
    return { size: '120px' };
  } else if (Array.isArray(key.key) && key.key.includes('|')) {
    return { size: '120px' };
  } else if (key.key === 'Enter') {
    return { size: '160px' };
  } else if (key.key === 'CapsLock') {
    return { size: '120px' };
  } else if (['Control', 'Fn', 'Alt', 'ContextMenu', 'Meta'].includes(key.key)) {
    return { size: '70px' };
  } else {
    return { size: '60px' };
  }
}

export {
  setKeySize,
  rows
};