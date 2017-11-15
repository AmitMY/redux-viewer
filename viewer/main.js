const DEFAULT_COLORS = {
  filters: '#F5A45D',
  action: '#FF0000',
  effects: '#86B342',
};

const forceHorse = document.querySelector('force-horse');

forceHorse.setConfig({
  showLabels: true,
  showNodeWeight: true,
  showEdgeWeight: true,
  showFilterButton: true,
  showLabelsButton: true,
  showNodeWeightButton: true,
  showEdgeWeightButton: true,
  useEdgesWeights: true,
  forceParameters: {
    '#charge': -350,
    '#linkStrength': 1,
    '#gravity': 0.2,
    '#linkDistance': 10,
    '#friction': 0.5
  }
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
      nodes.push({
        label: action,
        id: action,
        color: DEFAULT_COLORS.action,
        shape: 'circle'
      });
    });

    filters.forEach(effect => {
      nodes.push({
        label: effect.filter,
        id: 'filter-' + effect.index,
        color: DEFAULT_COLORS.filters,
        shape: 'triangle'
      });

      effect.ofType.forEach(action => {
        edges.push({
          source: action,
          target: 'filter-' + effect.index,
          weight: 5
        });
      });

      edges.push({
        source: 'filter-' + effect.index,
        target: effect.index,
        weight: 5,
        color: '#6FB1FC'
      });
    });

    effects.forEach(effect => {
      nodes.push({
        label: effect.name,
        id: effect.index,
        color: DEFAULT_COLORS.effects,
        shape: 'square'
      });

      if (effect.action) {
        effect.action.forEach(action => {
          if (this.isActionOptional(action)) {
            action = action.substr(0, action.length - 1);
            edges.push({source: effect.index, target: action, color: '#eef442'});
          } else {
            edges.push({source: effect.index, target: action, color: '#6FB1FC'});
          }
        });
      }

      if (!effect.filter) {
        effect.ofType.forEach(action => {
          edges.push({
              source: action,
              target: effect.index,
              color: '#EDA1ED'
          });
        });
      }
    });

    return {nodes, links: edges};
  }

  drawGraph() {
    this.data.then(effects => {
      effects = effects.map((effect, index) => ({...effect, index}));

      forceHorse.setData(this.getGraph(effects));

      console.log(this.getGraph(effects));
      console.log(forceHorse);
    });
  }
}

let effectsGraph = new EffectsGraph();
document.addEventListener('DOMContentLoaded', () => effectsGraph.drawGraph(), false);
