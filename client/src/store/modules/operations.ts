import {
  action,
  createModule,
  extractVuexModule,
  mutation,
  getter
} from "vuex-class-component";
import * as uuid from "uuid";

import Operation, {
  OperationStatus,
  OperationType,
  UpdateConfigMetadata
} from "@/types/Operation";

const VuexModule = createModule({
  namespaced: "operations"
});

export class OperationsStore extends VuexModule {
  private items: Operation[] = [];

  get all() {
    return this.items;
  }

  get byId() {
    return (id: string) => {
      return this.items.find(({ id: oid }) => oid === id);
    };
  }

  @action
  async addUpdateConfigOperation(metadata: UpdateConfigMetadata) {
    const id = uuid.v4();

    this.ADD_OPERATION({
      id,
      type: OperationType.UpdateConfig,
      status: OperationStatus.Active,
      metadata
    });

    return id;
  }

  @action
  async updateUpdateConfigOperation(params: {
    operation: Operation;
    metadata: UpdateConfigMetadata;
  }) {
    if (params.operation.type !== OperationType.UpdateConfig) {
      // Operation type not correct
      // TODO: Better error
      throw new Error();
    }

    this.UPDATE_OPERATION({
      ...params.operation,
      metadata: params.metadata
    });
  }

  @action
  async changeOperationStatus(params: { id: string; status: OperationStatus }) {
    const operation = this.items.find(op => op.id === params.id);
    if (!operation) {
      // Operation does not exist
      // TODO: Better error
      throw new Error();
    }

    this.UPDATE_OPERATION({ ...operation, status: params.status });
  }

  @action async deleteOperation(operation: Operation) {
    this.DELETE_OPERATION(operation.id);
  }

  @mutation
  private ADD_OPERATION(operation: Operation) {
    this.items.push({ ...operation });
  }

  @mutation
  private UPDATE_OPERATION(operation: Operation) {
    const index = this.items.findIndex(op => op.id === operation.id);
    if (index > -1) {
      this.items.splice(index, 1, operation);
    }
  }

  @mutation private DELETE_OPERATION(operationId: string) {
    const index = this.items.findIndex(op => op.id === operationId);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
}

export default extractVuexModule(OperationsStore);
