'use strict';
// Points and inks are authored in the 48 px cell. Direction order is
// front, left, right, back. Limb positions follow the four individual drawings.
module.exports = {
  triton: {
    master: 'art/companions/triton.png',
    ink: {d:'352732',i:'496779',h:'fff1d5',s:'f5b191',p:'fbd0ae',c:'e29579',m:'9c5758',t:'eea59a'},
    // The front near eye has a longer straight lid and the mouth lifts on one side.
    finish: [
      [[19,14,'pddd'],[19,15,'phid'],[19,16,'chic'],[26,14,'dddp'],[26,15,'dhic'],[26,16,'hisc'],[20,17,'spppppps'],[24,18,'mms']],
      [[21,14,'dih'],[21,15,'ih'],[20,18,'mp']],
      [[26,14,'hid'],[26,15,'hi'],[26,17,'pm']], []
    ],
    eyes: [[[19,14],[27,14]],[[21,13]],[[26,13]],[]],
    mouth: [[24,18],[20,18],[26,17],null],
    hands: [[30,29],[24,30],[22,30],[31,32]],
    tips: [[14,21],[33,19],[14,19],[31,24]],
    boots: [[19,29],[25,25],[22,22],[19,29]],
    sole: [44,44,44,45], knee: 34,
    arms: [[-2,-2],[-2,-2],[2,-2],[1,-1]], hairDrag: 1.1,
    idle: [[0,-1],[0,-1],[0,-1],[1,0]],
    gaze: 'brow',stride: 3.3
  },
  sophie: {
    master: 'art/companions/sophie.png',
    ink: {d:'452d32',v:'2e4138',i:'527951',g:'91ad74',h:'fff2d9',s:'f9c6a4',p:'ffe0bc',c:'eeaa92',m:'a35450',t:'df8d77'},
    // A high glint, taller jade iris and peach cheek keep her eyes open at 44px.
    // The brow and hair surround them asymmetrically in each separate drawing.
    finish: [
      [[19,15,'..s'],[18,16,'spppp'],[18,17,'d'],[23,17,'pps'],[23,18,'ppp'],[18,19,'cc'],[22,19,'ppps'],[29,19,'cc'],[21,20,'sppmmsp'],[22,21,'ssptp']],
      [[18,19,'ccp'],[18,20,'msp'],[19,21,'sp']],
      [[27,18,'pcc'],[26,19,'psm'],[26,20,'ps']], []
    ],
    eyes: [[[19,15],[26,15]],[[18,15]],[[25,14]],[]],
    eyeCels: {
      open:   ['pddp','dhvd','hvdi','pvig','ssip'],
      soft:   ['pddp','dhvd','hvdi','pvig','ssip'],
      glance: ['pddp','dvhd','vihp','vghp','sgsp'],
      blink:  ['sppp','pppp','dddp','csps','scpp'],
      smile:  ['sppp','pddp','dpsd','cssp','cppp'],
      wide:   ['pddd','hdhv','hvdi','hvig','sgi.']
    },
    mouthCels: {talk:['mt','sp'],laugh:['mmt','sts']},
    // Upper contour of the rear cape/hair, from left to right in four-pixel bands.
    // A separate rear speaking pose lets her glance over her own left shoulder.
    shoulderLook: {profile:1,dx:-1,seam:[34,34,34,34,32,29,25,26,29,30,31,31]},
    mouth: [[24,20],[18,20],[27,19],null],
    hands: [[22,24],[26,32],[21,32],[31,32]],
    tips: [[13,31],[33,30],[14,31],[16,32]],
    boots: [[21,27],[24,24],[24,24],[20,27]],
    sole: [45,45,45,45], knee: 37,
    arms: [[-2,-1],[-3,-2],[3,-2],[-1,-1]], hairDrag: 2.1,
    idle: [[0,-1],[0,-1],[0,-1],[-1,0]],
    gaze: 'soft',stride: 2.8
  },
  margaret: {
    master: 'docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png',
    ink: {d:'4a384d',i:'8b5db6',h:'f5e8ff',s:'fae4d5',p:'e8d8db',c:'e5cdce',m:'927586',t:'dc878b'},
    // Her resting cel is the exact original. Expressions use its own eye and skin inks.
    finish: [[],[],[],[]],
    eyes: [[[18,20],[26,20]],[[15,20]],[[28,20]],[]],
    mouth: [[22,24],[14,24],[30,24],null],
    hands: [[16,33],[15,34],[32,34],[30,33]],
    tips: [[32,30],[33,32],[13,32],[30,29]],
    boots: [[21,24],[21,21],[27,27],[22,24]],
    sole: [47,47,47,47], knee: 39,
    arms: [[2,-3],[1,-2],[-1,-2],[-1,-2]], hairDrag: 2.2,
    idle: [[1,-1],[1,-1],[-1,-1],[1,0]],
    gaze: 'glance',stride: 2.5
  }
};
