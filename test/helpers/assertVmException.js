export default async promise => {
    try {
        await promise;
        assert.fail('Expected "VM Exception" not received');
    } catch (error) {
        const revertFound = error.message.search('VM Exception') >= 0;
        assert(revertFound, `Expected "VM Exception", got ${error} instead`);
    }
};
