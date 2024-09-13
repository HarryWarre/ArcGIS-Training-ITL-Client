import {
  type extensionSpec,
  type ImmutableObject,
  type IMState,
} from "jimu-core";

export enum MyActionKeys { // List action keys
  MyDMA = "MyDMA",
}

export interface MyDMA {
  // Declare action
  type: MyActionKeys.MyDMA;
  val: any[];
}

// Action creator
export const setDMA = (dma: any[]): MyDMA => ({
  type: MyActionKeys.MyDMA,
  val: dma,
});

type ActionTypes = MyDMA;

interface MyState {
  data: [];
}
type IMMyState = ImmutableObject<MyState>;

declare module "jimu-core/lib/types/state" {
  interface State {
    myState?: IMMyState;
  }
}

// Redux store
export default class MyReduxStoreExtension
  implements extensionSpec.ReduxStoreExtension
{
  id = "my-local-redux-store-extension";

  getActions() {
    return Object.keys(MyActionKeys).map((k) => MyActionKeys[k]);
  }

  getInitLocalState() {
    return {
      data: [],
    };
  }

  getReducer() {
    return (
      localState: IMMyState,
      action: ActionTypes,
      appState: IMState
    ): IMMyState => {
      switch (action.type) {
        case MyActionKeys.MyDMA:
          return localState.set("data", action.val);
        default:
          return localState;
      }
    };
  }

  getStoreKey() {
    return "myState";
  }
}
