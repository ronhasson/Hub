function getRoles(num)
{
  switch(num)
  {
    case 7:
      return new Role[] {
        randomizeTownInvestigative(),
        randomizeTownSupport(),
        randomizeTownKilling(),
        randomizeRandomTown(),
        Role.Godfather,
        Role.Mafioso,
        randomizeRandomBenignOrEvil()
      };
  }
}

function randomizeTownInvestigative()
{
  Random r = new Random();
  switch(r.getNext(3))
  {
    case 0: return Role.Investigator;
    case 1: return Role.Sheriff;
    case 2: return Role.Spy;
  }
}
