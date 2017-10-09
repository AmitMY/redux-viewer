const DEFAULT_LAYOUT = {
  name: 'cose',
  padding: 50,
};

const DEFAULT_STYLE = cytoscape.stylesheet()
  .selector('node')
  .css({
    'shape': 'data(faveShape)',
    'width': 'mapData(weight, 40, 80, 20, 60)',
    'content': 'data(name)',
    'text-valign': 'center',
    'text-outline-width': 2,
    'text-outline-color': 'data(faveColor)',
    'background-color': 'data(faveColor)',
    'color': '#fff'
  })
  .selector(':selected')
  .css({
    'border-width': 3,
    'border-color': '#333'
  })
  .selector('edge')
  .css({
    'curve-style': 'bezier',
    'opacity': 0.666,
    'width': 'mapData(strength, 70, 100, 2, 6)',
    'target-arrow-shape': 'triangle',
    'source-arrow-shape': 'circle',
    'line-color': 'data(faveColor)',
    'source-arrow-color': 'data(faveColor)',
    'target-arrow-color': 'data(faveColor)'
  })
  .selector('edge.questionable')
  .css({
    'line-style': 'dotted',
    'target-arrow-shape': 'diamond'
  })
  .selector('.faded')
  .css({
    'opacity': 0.25,
    'text-opacity': 0
  });

class EffectsGraph {
  constructor() {
    this.data = fetch('effects.json')
      .then(res => res.json());
  }

  isActionOptional(action) {
    return action[action.length - 1] === '?';
  }

  getActions(effects) {
    let actions = [];
    effects.forEach(effect => {
      effect.ofType.forEach(a => actions = actions.concat(a));
      if (effect.action) {
        effect.action.forEach(a => actions = actions.concat(a));
      }
    });

    actions = actions.map(a => {
      if (this.isActionOptional(a)) {
        return a.substr(0, a.length - 1);
      }
      return a;
    });

    return Array.from(new Set(actions));
  }

  getGraph(effects) {
    console.log(effects);

    const actions = this.getActions(effects);
    const filters = effects.filter(e => e.filter);


    let nodes = [], edges = [];
    actions.forEach(action => {
      nodes.push({data: {id: action, name: action, faveColor: '#FF0000', faveShape: 'ellipse'}});
    });
    filters.forEach(effect => {
      nodes.push({
        data: {
          id: 'filter-' + effect.index,
          name: effect.filter,
          faveColor: '#F5A45D',
          faveShape: 'triangle'
        }
      });
      effect.ofType.forEach(action => {
        edges.push({
          data: {
            source: action,
            target: 'filter-' + effect.index,
            faveColor: '#EDA1ED'
          }
        });
      });
      edges.push({data: {source: 'filter-' + effect.index, target: effect.index, faveColor: '#6FB1FC'}});
    });
    effects.forEach(effect => {
      nodes.push({data: {id: effect.index, name: effect.name, faveColor: '#86B342', faveShape: 'rectangle'}});
      if (effect.action) {
        effect.action.forEach(action => {
          if (this.isActionOptional(action)) {
            action = action.substr(0, action.length - 1);
            edges.push({data: {source: effect.index, target: action, faveColor: '#eef442'}});
          } else {
            edges.push({data: {source: effect.index, target: action, faveColor: '#6FB1FC'}});
          }
        });
      }
      if (!effect.filter) {
        effect.ofType.forEach(action => {
          edges.push({
            data: {
              source: action,
              target: effect.index,
              faveColor: '#EDA1ED'
            }
          });
        });
      }
    });

    nodes.forEach(n => n.weight = 10000);

    return {nodes, edges};
  }

  drawGraph() {
    this.data.then(effects => {
      effects = effects.map((effect, index) => ({...effect, index}));

      cytoscape({
        container: document.getElementById('cy'),

        layout: DEFAULT_LAYOUT,

        style: DEFAULT_STYLE,

        elements: this.getGraph(effects),
        // elements: { //
        //   nodes: [
        //     {data: {id: 'j', name: 'Jerry', weight: 65, faveColor: '#6FB1FC', faveShape: 'triangle'}},
        //     {data: {id: 'e', name: 'Elaine', weight: 45, faveColor: '#EDA1ED', faveShape: 'ellipse'}},
        //     {data: {id: 'k', name: 'Kramer', weight: 75, faveColor: '#86B342', faveShape: 'octagon'}},
        //     {data: {id: 'g', name: 'George', weight: 70, faveColor: '#F5A45D', faveShape: 'rectangle'}}
        //   ],
        //   edges: [
        //     {data: {source: 'j', target: 'e', faveColor: '#6FB1FC', strength: 90}},
        //     {data: {source: 'j', target: 'k', faveColor: '#6FB1FC', strength: 70}},
        //     {data: {source: 'j', target: 'g', faveColor: '#6FB1FC', strength: 80}},
        //
        //     {data: {source: 'e', target: 'j', faveColor: '#EDA1ED', strength: 95}},
        //     {data: {source: 'e', target: 'k', faveColor: '#EDA1ED', strength: 60}, classes: 'questionable'},
        //
        //     {data: {source: 'k', target: 'j', faveColor: '#86B342', strength: 100}},
        //     {data: {source: 'k', target: 'e', faveColor: '#86B342', strength: 100}},
        //     {data: {source: 'k', target: 'g', faveColor: '#86B342', strength: 100}},
        //
        //     {data: {source: 'g', target: 'j', faveColor: '#F5A45D', strength: 90}}
        //   ]
        // },

        ready: function () {
          window.cy = this;
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new EffectsGraph().drawGraph(), false);
