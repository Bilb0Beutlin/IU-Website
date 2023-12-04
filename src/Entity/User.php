<?php

namespace App\Entity;

use App\Repository\{UserRepository, GameNightRepository, GameRepository};
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $userName = null;

    #[ORM\Column(length: 255)]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    private ?string $lastName = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateOfBirth = null;

    #[ORM\ManyToMany(targetEntity: Game::class, mappedBy: 'likedBy', cascade:['persist'])]
    private Collection $preferredGames;

    #[ORM\ManyToMany(targetEntity: GameNight::class, inversedBy: 'visitors')]
    private Collection $attends;

    #[ORM\Column(length: 1)]
    private ?string $gender = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(type: 'boolean')]
    private $isVerified = false;

    public function __construct()
    {
        $this->preferredGames = new ArrayCollection();
        $this->attends = new ArrayCollection();
    }

    /**
     * The public representation of the user (e.g. a username, an email address, etc.)
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }
    
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getUserName(): ?string
    {
        return $this->userName;
    }

    public function setUserName(string $userName): static
    {
        $this->userName = $userName;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getDateOfBirth(): ?\DateTimeInterface
    {
        return $this->dateOfBirth;
    }

    public function setDateOfBirth(\DateTimeInterface $dateOfBirth): static
    {
        $this->dateOfBirth = $dateOfBirth;

        return $this;
    }

    /**
     * @return Collection<int, Game>
     */
    public function getPreferredGames(): Collection
    {
        return $this->preferredGames;
    }

    public function addPreferredGame(Game $preferredGame): static
    {
        if (!$this->preferredGames->contains($preferredGame)) {
            $this->preferredGames->add($preferredGame);
            $preferredGame->addLikedBy($this);
        }

        return $this;
    }
    public function setPreferredGame(Game $preferredGame): static
    {
        $this->preferredGame = $preferredGame;

        return $this;
    }

    public function removePreferredGame(Game $preferredGame): static
    {
        if ($this->preferredGames->removeElement($preferredGame)) {
            $preferredGame->removeLikedBy($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, gameNight>
     */
    public function getAttends(): Collection
    {
        return $this->attends;
    }

    public function addAttend(GameNight $attend): static
    {
        if (!$this->attends->contains($attend)) {
            $this->attends->add($attend);
        }

        return $this;
    }

    public function removeAttend(GameNight $attend): static
    {
        $this->attends->removeElement($attend);

        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setGender(string $gender): static
    {
        $this->gender = $gender;

        return $this;
    }
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }
}
?>