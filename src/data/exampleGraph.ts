
export const EXAMPLE_GRAPH = {
{"nodes": [
    {
      "id": "network-1750337202178-7623",
      "type": "customNode",
      "position": {
        "x": 586,
        "y": 97.66666412353516
      },
      "data": {
        "type": "network",
        "label": "NETWORK Node",
        "nodeId": "network-1750337202178-7623"
      },
      "selected": true
    },
    {
      "id": "cell-area-1",
      "type": "customNode",
      "position": {
        "x": 387.9999999999999,
        "y": 283.66666412353516
      },
      "data": {
        "type": "cell-area",
        "label": "CELL-AREA Node",
        "parentId": "network-1750337202178-7623",
        "nodeId": "cell-area-1",
        "cellAreaId": 1,
        "cellAreaDescription": "TAC 1",
        "id": "cell-area-1"
      },
      "selected": false
    },
    {
      "id": "cell-area-2",
      "type": "customNode",
      "position": {
        "x": 804.9999999999999,
        "y": 285.66666412353516
      },
      "data": {
        "type": "cell-area",
        "label": "CELL-AREA Node",
        "parentId": "network-1750337202178-7623",
        "nodeId": "cell-area-2",
        "cellAreaId": 2,
        "cellAreaDescription": "TAC 2",
        "id": "cell-area-2"
      },
      "selected": false
    },
    {
      "id": "rrp-1750337216606-1118",
      "type": "customNode",
      "position": {
        "x": 599.9999999999998,
        "y": 539.6666641235352
      },
      "data": {
        "type": "rrp",
        "label": "RRP Node",
        "parentId": "cell-area-1",
        "nodeId": "rrp-1750337216606-1118",
        "rrpPercentage": 100,
        "plmn": "",
        "rrpBands": [
          {
            "name": "N78",
            "dl": 50,
            "ul": 50
          }
        ]
      },
      "selected": false
    },
    {
      "id": "rrpmember-1750337236107-7355",
      "type": "customNode",
      "position": {
        "x": 839.9999999999998,
        "y": 831.6666641235352
      },
      "data": {
        "type": "rrpmember",
        "label": "RRPMEMBER Node",
        "parentId": "rrp-1750337216606-1118",
        "nodeId": "rrpmember-1750337236107-7355",
        "plmnValue": "240 01"
      },
      "selected": false
    },
    {
      "id": "rrpmember-1750337242468-2761",
      "type": "customNode",
      "position": {
        "x": 417.9999999999998,
        "y": 827.6666641235352
      },
      "data": {
        "type": "rrpmember",
        "label": "RRPMEMBER Node",
        "parentId": "rrp-1750337216606-1118",
        "nodeId": "rrpmember-1750337242468-2761",
        "plmnValue": "240 49"
      },
      "selected": false
    },
    {
      "id": "s-nssai-1",
      "type": "customNode",
      "position": {
        "x": 329.99999999999966,
        "y": 1069.6666641235352
      },
      "data": {
        "type": "s-nssai",
        "label": "S-NSSAI Node",
        "parentId": "rrpmember-1750337242468-2761",
        "nodeId": "s-nssai-1",
        "snssaiId": 1,
        "sd": "1",
        "sst": "50"
      },
      "selected": false
    },
    {
      "id": "s-nssai-2",
      "type": "customNode",
      "position": {
        "x": 751.9999999999997,
        "y": 1073.6666641235352
      },
      "data": {
        "type": "s-nssai",
        "label": "S-NSSAI Node",
        "parentId": "rrpmember-1750337236107-7355",
        "nodeId": "s-nssai-2",
        "snssaiId": 2,
        "sd": "1",
        "sst": "1"
      },
      "selected": false
    },
    {
      "id": "dnn-1",
      "type": "customNode",
      "position": {
        "x": 611.9999999999995,
        "y": 1355.6666641235352
      },
      "data": {
        "type": "dnn",
        "label": "DNN Node",
        "parentId": "s-nssai-1",
        "nodeId": "dnn-1",
        "dnnId": "1",
        "dnnCustomName": "telia.test.ns"
      },
      "selected": false
    },
    {
      "id": "5qi-9",
      "type": "customNode",
      "position": {
        "x": 539.9999999999997,
        "y": 1547.6666641235352
      },
      "data": {
        "type": "5qi",
        "label": "5QI Node",
        "parentId": "dnn-1",
        "nodeId": "5qi-9",
        "fiveQIId": "9"
      },
      "selected": false
    }
  ],
  "edges": [
    {
      "id": "network-1750337202178-7623-cell-area-1",
      "source": "network-1750337202178-7623",
      "target": "cell-area-1",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "id": "network-1750337202178-7623-cell-area-2",
      "source": "network-1750337202178-7623",
      "target": "cell-area-2",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "id": "cell-area-1-rrp-1750337216606-1118",
      "source": "cell-area-1",
      "target": "rrp-1750337216606-1118",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      },
      "source": "cell-area-2",
      "sourceHandle": "bottom-source",
      "target": "rrp-1750337216606-1118",
      "targetHandle": "top-target",
      "id": "xy-edge__cell-area-2bottom-source-rrp-1750337216606-1118top-target"
    },
    {
      "id": "rrp-1750337216606-1118-rrpmember-1750337236107-7355",
      "source": "rrp-1750337216606-1118",
      "target": "rrpmember-1750337236107-7355",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "id": "rrp-1750337216606-1118-rrpmember-1750337242468-2761",
      "source": "rrp-1750337216606-1118",
      "target": "rrpmember-1750337242468-2761",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "id": "rrp-1750337216606-1118-rrpmember-1750337329538-3864",
      "source": "rrp-1750337216606-1118",
      "target": "rrpmember-1750337329538-3864",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "id": "rrpmember-1750337242468-2761-s-nssai-1",
      "source": "rrpmember-1750337242468-2761",
      "target": "s-nssai-1",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      },
      "source": "rrpmember-1750337236107-7355",
      "sourceHandle": "bottom-source",
      "target": "s-nssai-1",
      "targetHandle": "top-target",
      "id": "xy-edge__rrpmember-1750337236107-7355bottom-source-s-nssai-1top-target"
    },
    {
      "id": "rrpmember-1750337236107-7355-s-nssai-2",
      "source": "rrpmember-1750337236107-7355",
      "target": "s-nssai-2",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      },
      "source": "rrpmember-1750337242468-2761",
      "sourceHandle": "bottom-source",
      "target": "s-nssai-2",
      "targetHandle": "top-target",
      "id": "xy-edge__rrpmember-1750337242468-2761bottom-source-s-nssai-2top-target"
    },
    {
      "id": "s-nssai-1-dnn-1",
      "source": "s-nssai-1",
      "target": "dnn-1",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    },
    {
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      },
      "source": "s-nssai-2",
      "sourceHandle": "bottom-source",
      "target": "dnn-1",
      "targetHandle": "top-target",
      "id": "xy-edge__s-nssai-2bottom-source-dnn-1top-target"
    },
    {
      "id": "dnn-1-5qi-9",
      "source": "dnn-1",
      "target": "5qi-9",
      "sourceHandle": "bottom-source",
      "targetHandle": "top-target",
      "type": "default",
      "animated": false,
      "style": {
        "stroke": "#2563eb",
        "strokeWidth": 3,
        "opacity": 1
      },
      "markerEnd": {
        "type": "arrowclosed",
        "color": "#2563eb",
        "width": 12,
        "height": 12
      }
    }
  ],
  "timestamp": 1750337555550
}
};
