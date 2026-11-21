import importlib

import pytest

GOOD = {
    "ENV": "production",
    "MOAGI_SECRET": "x" * 48,
    "ALLOWED_ORIGINS": "https://moagi.example",
    "DATABASE_URL": "postgresql://u:p@localhost:5432/moagi",
    "SEED_DEMO": "false",
}


def load(monkeypatch, tmp_path, **env):
    for key in ("ENV", "MOAGI_SECRET", "ALLOWED_ORIGINS", "DATABASE_URL", "SEED_DEMO", "TRUSTED_HOSTS"):
        monkeypatch.delenv(key, raising=False)
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "up"))
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    import app.config as config

    return importlib.reload(config)


def test_good_production_config_loads(monkeypatch, tmp_path):
    config = load(monkeypatch, tmp_path, **GOOD)
    assert config.IS_PROD and not config.SEED_DEMO


@pytest.mark.parametrize(
    "override",
    [
        {"MOAGI_SECRET": "short"},
        {"MOAGI_SECRET": "dev-secret-change-me-before-launch"},
        {"ALLOWED_ORIGINS": ""},
        {"ALLOWED_ORIGINS": "http://moagi.example"},
        {"DATABASE_URL": "sqlite:///moagi.db"},
        {"SEED_DEMO": "true"},
    ],
)
def test_bad_production_config_rejected(monkeypatch, tmp_path, override):
    with pytest.raises(RuntimeError):
        load(monkeypatch, tmp_path, **{**GOOD, **override})


def test_unknown_env_rejected(monkeypatch, tmp_path):
    with pytest.raises(RuntimeError):
        load(monkeypatch, tmp_path, ENV="prod")


def test_dev_defaults(monkeypatch, tmp_path):
    config = load(monkeypatch, tmp_path)
    assert not config.IS_PROD and config.SEED_DEMO


def test_postgres_scheme_normalised_and_origins_cleaned(monkeypatch, tmp_path):
    config = load(
        monkeypatch,
        tmp_path,
        **{**GOOD, "DATABASE_URL": "postgres://u:p@h/db", "ALLOWED_ORIGINS": "https://a.com/, https://b.com"},
    )
    assert config.DATABASE_URL.startswith("postgresql://")
    assert config.ALLOWED_ORIGINS == ["https://a.com", "https://b.com"]
