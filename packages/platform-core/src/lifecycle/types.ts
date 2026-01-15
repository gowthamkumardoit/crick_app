export interface StateTransition<S extends string> {
    from: S;
    to: S;
}
